import {
  Alert,
  Box,
  Button,
  Card,
  EthereumAccount,
  Field,
  FileUpload,
  Form,
  Link,
  List,
  ListItem,
  Text,
  Textarea,
  useArchon,
  useContract,
  useWeb3,
} from "@kleros/components";
import { useField } from "formik";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useRef } from "react";

import { useEvidenceFile } from "data";
import getVideoEmptyBorderSize from "lib/get-video-empty-border-size";

const VIDEO_OPTIONS = {
  types: {
    value: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"],
    label: "*.mp4, *.webm, *.avi, *.mov",
  },
  size: {
    value: 7 * 1024 * 1024,
    label: "7 MB",
  },
  dimensions: {
    minWidth: 352,
    minHeight: 352,
  },
};

const PHOTO_OPTIONS = {
  types: {
    value: ["image/jpeg", "image/png"],
    label: "*.jpg, *.jpeg, *.png",
  },
  size: {
    value: 2 * 1024 * 1024,
    label: "2 MB",
  },
};

const sanitize = (input) =>
  input
    .toString()
    .toLowerCase()
    .replace(/([^\d.a-z]+)/gi, "-"); // Only allow numbers and aplhanumeric.

function pageScroll() {
  window.scroll({
    top: document.body.scrollHeight,
    left: 0,
    behavior: "smooth",
  });
}

function UpdateTotalCost({ totalCost }) {
  const { web3 } = useWeb3();
  const totalCostRef = useRef(totalCost);
  const field = useField("contribution");
  const setValue = field[2].setValue;
  useEffect(() => {
    if (totalCost && totalCostRef.current !== web3.utils.fromWei(totalCost)) {
      totalCostRef.current = web3.utils.fromWei(totalCost);
      setValue(totalCostRef.current);
    }
  }, [totalCost, setValue, web3.utils]);
  return null;
}

const SubmitProfileForm = memo(
  ({
    registrationMetaEvidence,
    submissionName,
    totalCost,
    reapply,
    onSend,
    onSendError,
    onPhotoUploadProgress,
    onVideoUploadProgress,
    onSubmissionUploadProgress,
    setWaitingForTransaction,
  }) => {
    const { web3 } = useWeb3();

    const { upload, uploadWithProgress } = useArchon();
    const { send } = useContract(
      "proofOfHumanity",
      reapply ? "reapplySubmission" : "addSubmission"
    );

    const metaEvidence = useEvidenceFile()(registrationMetaEvidence.URI);

    const router = useRouter();

    const handleFormReset = useCallback(() => {
      router.back();
    }, [router]);

    const [accounts] = useWeb3("eth", "getAccounts");
    const account = accounts?.[0] ?? null;

    return (
      <Form
        createValidationSchema={useCallback(
          ({ string, file, eth, web3: _web3 }) => {
            const schema = {
              name: string()
                .max(50, "Must be 50 characters or less.")
                .required("Required")
                .default(submissionName),
              firstName: string()
                .max(20, "Must be 20 characters or less.")
                .matches(
                  /^[\s\w]*$/,
                  "Only letters from a to z and spaces are allowed."
                ),
              lastName: string()
                .max(20, "Must be 20 characters or less.")
                .matches(
                  /^[\s\w]*$/,
                  "Only letters from a to z and spaces are allowed."
                ),
              bio: string().max(70, "Must be 70 characters or less."),
              photo: file()
                .required("Required")
                .test(
                  "fileSize",
                  `Photo should be ${PHOTO_OPTIONS.size.label} or less`,
                  (value) =>
                    !value ? true : value.size <= PHOTO_OPTIONS.size.value
                )
                .test(
                  "fileType",
                  `Photo should be one of the following types: ${PHOTO_OPTIONS.types.label}`,
                  (value) =>
                    !value
                      ? true
                      : PHOTO_OPTIONS.types.value.some((allowedMimeType) => {
                          const [mimeType] = String(value.type)
                            .toLowerCase()
                            .split(";");
                          return mimeType === allowedMimeType;
                        })
                ),
              video: file()
                .required("Required")
                .test(
                  "fileSize",
                  `Video should be ${VIDEO_OPTIONS.size.label} or less`,
                  (value) =>
                    !value ? true : value.size <= VIDEO_OPTIONS.size.value
                )
                .test(
                  "fileType",
                  `Video should be one of the following types: ${VIDEO_OPTIONS.types.label}`,
                  (value) =>
                    !value
                      ? true
                      : VIDEO_OPTIONS.types.value.some((allowedMimeType) => {
                          const [mimeType] = String(value.type)
                            .toLowerCase()
                            .split(";");
                          return mimeType === allowedMimeType;
                        })
                )
                .test(
                  "validity",
                  `Video validation error`,
                  // Not using arrow function syntax so that the caller
                  // can inject `this` to make `this.createError` available
                  function (value) {
                    return !value
                      ? true
                      : new Promise((resolve) => {
                          const video = document.createElement("video");

                          video.addEventListener("loadeddata", () => {
                            const { videoWidth, videoHeight } = video;
                            const { minWidth, minHeight } =
                              VIDEO_OPTIONS.dimensions;

                            const isVideoTooSmall =
                              videoWidth < minWidth || videoHeight < minHeight;

                            const emptyBorderSize =
                              getVideoEmptyBorderSize(video);
                            const isVideoPictureTooSmall =
                              videoWidth - emptyBorderSize.width < minWidth ||
                              videoHeight - emptyBorderSize.height < minHeight;

                            resolve(
                              isVideoTooSmall
                                ? this.createError({
                                    message: `Video should be at least ${minWidth}px wide and at least ${minHeight}px tall`,
                                  })
                                : isVideoPictureTooSmall
                                ? this.createError({
                                    message: `The video has empty bars along the sides that make it so the viewable area is too small (it should be at least ${minWidth}px wide and ${minHeight}px tall).`,
                                  })
                                : true
                            );
                          });

                          video.addEventListener("error", () => {
                            resolve(
                              this.createError({
                                message: "Video file doesn't seem to be valid",
                              })
                            );
                          });

                          video.preload = "auto";
                          video.src = value.preview;
                        });
                  }
                ),
              contribution: eth().test({
                test(value) {
                  if (totalCost && value.gt(totalCost))
                    return this.createError({
                      message: `You can't contribute more than the base deposit of ${_web3.utils.fromWei(
                        totalCost
                      )} ETH.`,
                    });
                  return true;
                },
              }),
            };
            if (totalCost)
              schema.contribution = schema.contribution.default(
                _web3.utils.fromWei(totalCost)
              );
            return schema;
          },
          [totalCost, submissionName]
        )}
        onReset={handleFormReset}
        onSubmit={async ({
          name,
          firstName,
          lastName,
          bio,
          photo,
          video,
          contribution,
        }) => {
          [{ pathname: photo }, { pathname: video }] = await Promise.all([
            uploadWithProgress(
              sanitize(photo.name),
              photo.content,
              {
                onProgress: onPhotoUploadProgress,
              },
              "file"
            ),
            uploadWithProgress(
              sanitize(video.name),
              video.content,
              {
                onProgress: onVideoUploadProgress,
              },
              "file"
            ),
          ]);
          pageScroll();
          const { pathname: fileURI } = await upload(
            "file.json",
            JSON.stringify({ name, firstName, lastName, bio, photo, video }),
            "file"
          );
          const { pathname: evidence } = await uploadWithProgress(
            "registration.json",
            JSON.stringify({ fileURI, name: "Registration" }),
            {
              onProgress: onSubmissionUploadProgress,
            },
            "file"
          );
          if (reapply) {
            const messageParameters = JSON.stringify({
              domain: {
                name: "Proof Of Humanity",
              },
              message: {
                claim: `Reapplying for proof of humanity. My address is ${accounts?.[0].toLowerCase()}`,
              },
              primaryType: "Auth",
              types: {
                EIP712Domain: [{ name: "name", type: "string" }],
                Auth: [{ name: "claim", type: "string" }],
              },
            });

            const from = accounts?.[0];
            const parameters = [from, messageParameters];
            const method = "eth_signTypedData_v4";

            const promiseRequestSignature = () =>
              new Promise((resolve, reject) => {
                web3.currentProvider.sendAsync(
                  {
                    method,
                    params: parameters,
                    from,
                  },
                  (err, result) => {
                    if (err) return reject(err);

                    return resolve(result);
                  }
                );
              });

            const requestSigResult = await promiseRequestSignature();
            const signature = requestSigResult.result;

            await fetch(
              `${process.env.NEXT_PUBLIC_VOUCH_DB_URL}/vouch/deleteSubmission`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  signature,
                  submissionId: accounts?.[0],
                }),
              }
            );
          }

          try {
            setWaitingForTransaction(true);
            pageScroll();
            const result = await send(evidence, name, {
              value: String(contribution) === "" ? 0 : contribution,
            });

            onSend?.();

            return result;
          } catch (err) {
            setWaitingForTransaction(false);
            onSendError?.(err);
          }
        }}
      >
        {({ isSubmitting }) => (
          <>
            <Alert type="muted" title="Public Address" sx={{ mb: 3 }}>
              <EthereumAccount
                address={account}
                diameter={24}
                sx={{ maxWidth: 388, color: "text", fontWeight: "bold" }}
              />
              <Text>
                To improve your privacy, we recommend using an address which is
                already public or a new one-seeded through{" "}
                <Link
                  href="https://tornado.cash"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  tornado.cash
                </Link>
                .
              </Text>
            </Alert>
            <Alert type="muted" title="Advice" sx={{ mb: 3 }}>
              <Text>
                Submissions are final and cannot be edited. Be sure to follow
                all submission rules to not lose your deposit.
              </Text>
            </Alert>
            <Field
              name="name"
              label="Display Name"
              placeholder="The name you go by"
              readOnly={submissionName !== ""}
              info={
                submissionName !== ""
                  ? "You have set your display name previously, so it cannot be changed"
                  : ""
              }
            />
            <Field
              name="firstName"
              label="First Name"
              placeholder="(In basic Latin)"
            />
            <Field
              name="lastName"
              label="Last Name"
              placeholder="(In basic Latin)"
            />
            <Field as={Textarea} name="bio" label="Short Bio" />
            <Alert type="muted" title="Pro Tip" sx={{ mb: 3 }}>
              <Text>
                People can try to notify you of problems in your submission and
                save your deposit via your{" "}
                <Link href="https://ethmail.cc/">ethmail.cc</Link>. Make sure to
                check it while submission is being processed.
              </Text>
            </Alert>
            <Field
              as={FileUpload}
              name="photo"
              label="Face Photo"
              accept={PHOTO_OPTIONS.types.value}
              acceptLabel={PHOTO_OPTIONS.types.label}
              maxSizeLabel={PHOTO_OPTIONS.size.label}
              photo
            />
            <Card
              variant="muted"
              sx={{ marginBottom: 2 }}
              header="Photo Instructions:"
              mainSx={{ padding: 0 }}
            >
              <List>
                <ListItem>
                  The picture should include the face of the submitter facing
                  the camera and the facial features must be visible.
                </ListItem>
                <ListItem>
                  Face should not be covered under heavy make-up, large
                  piercings or masks hindering the visibility of facial
                  features. Headcover not covering the internal region of the
                  face is acceptable (For example, a hijab is acceptable for a
                  submitter but a niqab is not).
                </ListItem>
                <ListItem>
                  It can include items worn daily (ex: headscarf, turban, wig,
                  light makeup, etc) provided they do not violate the previous
                  point. It cannot include special items worn only on special
                  occasions.
                </ListItem>
              </List>
            </Card>
            <Field
              as={FileUpload}
              name="video"
              label="Video (See Instructions)"
              accept={VIDEO_OPTIONS.types.value}
              acceptLabel={VIDEO_OPTIONS.types.label}
              maxSizeLabel={VIDEO_OPTIONS.size.label}
              video
            />
            <Card
              variant="muted"
              sx={{ marginBottom: 2 }}
              header="Video Instructions:"
              mainSx={{
                padding: 0,
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <List>
                <ListItem>
                  The sign should display in a readable manner the full Ethereum
                  address of the submitter (No ENS; no ellipsis). The sign can
                  be a screen. The submitter must show the sign in the right
                  orientation to be read on the video.
                </ListItem>
                <ListItem>
                  The submitter must say (in English) « I certify that I am a
                  real human and that I am not already registered in this
                  registry » Submitters should speak in their normal voice.
                </ListItem>
                <ListItem>
                  Video submissions must follow all of the following
                  requirements:
                  <List>
                    <ListItem>at most 2 minutes long,</ListItem>
                    <ListItem>
                      in the video/webm, video/MP4, video/avi or video/mov
                      format,
                    </ListItem>
                    <ListItem>
                      vertical (portrait), horizontal (landscape) or square,
                    </ListItem>
                  </List>
                  and follow these minimum size requirements:
                  <List>
                    <ListItem>
                      Minimum height: equal to or higher than 352 pixels
                    </ListItem>
                    <ListItem>
                      Minimum width: equal to or higher than 352 pixels
                    </ListItem>
                  </List>
                </ListItem>
                <ListItem>
                  Lighting conditions and recording device quality should be
                  sufficient to discern facial features and characters composing
                  the Ethereum address displayed.
                </ListItem>
                <ListItem>
                  The quality of the audio should be high enough such that the
                  speaker can be understood clearly.
                </ListItem>
                <ListItem>
                  The face of the submitter should follow the same requirements
                  than for the photo
                </ListItem>
                <ListItem>
                  Be sure that the preview of your video works as expected
                  before funding your submission. Even if your video file format
                  is compatible, the codec inside might not be supported by
                  popular web browsers.
                </ListItem>
              </List>
            </Card>
            <Alert type="muted" title="Tip" sx={{ mb: 3 }}>
              <Text>
                The video should display the same address as the one used for
                the submission. Be careful with mirrored videos and consult the
                acceptance criteria document at the bottom to avoid losing your
                deposit.
              </Text>
            </Alert>
            <Field
              name="contribution"
              label={({ field }) => (
                <Text>
                  Initial Deposit (ETH)
                  <Button
                    as={Box}
                    variant="secondary"
                    sx={{
                      marginX: 2,
                      ...(totalCost &&
                        field[1].value.replaceAll?.(",", ".") ===
                          web3.utils.fromWei(totalCost) && {
                          backgroundColor: "skeleton",
                        }),
                    }}
                    onClick={() =>
                      field[2].setValue(web3.utils.fromWei(totalCost))
                    }
                  >
                    Self Fund: {totalCost ? web3.utils.fromWei(totalCost) : "-"}
                  </Button>
                  <Button
                    as={Box}
                    variant="secondary"
                    sx={
                      totalCost &&
                      field[1].value.replaceAll?.(",", ".") !==
                        web3.utils.fromWei(totalCost) && {
                        backgroundColor: "skeleton",
                      }
                    }
                    onClick={() => field[2].setValue(web3.utils.toBN(0))}
                  >
                    Crowdfund
                  </Button>
                </Text>
              )}
              placeholder="The rest will be left for crowdfunding."
              type="number"
              sx={({ field }) =>
                totalCost &&
                field[1].value.replaceAll?.(",", ".") ===
                  web3.utils.fromWei(totalCost) && {
                  display: "none",
                }
              }
              info="The deposit is reimbursed after successful registration, and lost after failure. Any amount not contributed now can be put up by crowdfunders later."
            />
            <Card
              variant="muted"
              sx={{ fontSize: 1, marginBottom: 2 }}
              mainSx={{ padding: 0 }}
            >
              <Link newTab href={metaEvidence?.fileURI}>
                <Text>{metaEvidence && "Registration Rules"}</Text>
              </Link>
            </Card>
            <Button
              type="submit"
              onClick={(event) => event.preventDefault()}
              disabled={isSubmitting}
              loading={isSubmitting}
              sx={{
                width: "120px",
              }}
            >
              Submit
            </Button>
            <Button
              type="reset"
              variant="outlined"
              disabled={isSubmitting}
              sx={{
                marginLeft: "1rem",
              }}
            >
              Go Back
            </Button>
            <Text sx={{ marginTop: 1 }}>
              Remember to subscribe to email notifications in Account &gt;
              Notifications to be notified of status changes and any potential
              challenge raised against your registration.
            </Text>
            <UpdateTotalCost totalCost={totalCost} />
          </>
        )}
      </Form>
    );
  }
);

SubmitProfileForm.displayName = "SubmitProfileForm";

export default SubmitProfileForm;
