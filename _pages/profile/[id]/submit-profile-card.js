import {
  Box,
  Button,
  Card,
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
import { PersistFormikValues } from "formik-persist-values";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { graphql, useFragment } from "relay-hooks";

import useIsGraphSynced from "_pages/index/use-is-graph-synced";
import { useEvidenceFile } from "data";

const sanitize = (input) =>
  input
    .toString()
    .toLowerCase()
    .replace(/([^\d.a-z]+)/gi, "-"); // Only allow numbers and aplhanumeric.

const submitProfileCardFragment = graphql`
  fragment submitProfileCard on Contract {
    arbitrator
    arbitratorExtraData
    submissionBaseDeposit
    registrationMetaEvidence {
      URI
    }
  }
`;
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
export default function SubmitProfileCard({ contract, reapply }) {
  const {
    arbitrator,
    arbitratorExtraData,
    submissionBaseDeposit,
    registrationMetaEvidence,
  } = useFragment(submitProfileCardFragment, contract);

  const { web3 } = useWeb3();
  const [arbitrationCost] = useContract(
    "klerosLiquid",
    "arbitrationCost",
    useMemo(
      () => ({
        address: arbitrator,
        args: [arbitratorExtraData],
      }),
      [arbitrator, arbitratorExtraData]
    )
  );
  const totalCost = useMemo(
    () => arbitrationCost?.add(web3.utils.toBN(submissionBaseDeposit)),
    [arbitrationCost, web3.utils, submissionBaseDeposit]
  );

  const { upload } = useArchon();
  const { receipt, send } = useContract(
    "proofOfHumanity",
    reapply ? "reapplySubmission" : "addSubmission"
  );
  const isGraphSynced = useIsGraphSynced(receipt?.blockNumber);

  const metaEvidence = useEvidenceFile()(registrationMetaEvidence.URI);
  return (
    <Card
      header="Submit Profile"
      headerSx={{
        backgroundColor: "accent",
        color: "background",
        fontWeight: "bold",
      }}
    >
      <Form
        createValidationSchema={useCallback(
          ({ string, file, eth, web3: _web3 }) => {
            const schema = {
              name: string()
                .max(50, "Must be 50 characters or less.")
                .required("Required"),
              firstName: string()
                .max(20, "Must be 20 characters or less.")
                .matches(
                  /^[\s\w]*$/,
                  "Only letters from a to z and spaces are allowed."
                )
                .required("Required"),
              lastName: string()
                .max(20, "Must be 20 characters or less.")
                .matches(
                  /^[\s\w]*$/,
                  "Only letters from a to z and spaces are allowed."
                )
                .required("Required"),
              bio: string().max(70, "Must be 70 characters or less."),
              photo: file().required("Required"),
              video: file().required("Required"),
              contribution: eth()
                .test({
                  test(value) {
                    if (totalCost && value.gt(totalCost))
                      return this.createError({
                        message: `You can't contribute more than the base deposit of ${_web3.utils.fromWei(
                          totalCost
                        )} ETH.`,
                      });
                    return true;
                  },
                })
                .test({
                  async test(value) {
                    const [account] = await _web3.eth.getAccounts();
                    if (!account) return true;
                    const balance = _web3.utils.toBN(
                      await _web3.eth.getBalance(account)
                    );
                    if (value.gt(balance))
                      return this.createError({
                        message: `You can't contribute more than your balance of ${_web3.utils.fromWei(
                          balance
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
          [totalCost]
        )}
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
            upload(sanitize(photo.name), photo.content),
            upload(sanitize(video.name), video.content),
          ]);
          const { pathname: fileURI } = await upload(
            "file.json",
            JSON.stringify({ name, firstName, lastName, bio, photo, video })
          );
          const { pathname: evidence } = await upload(
            "registration.json",
            JSON.stringify({ fileURI, name: "Registration" })
          );
          return send(evidence, name, {
            value: String(contribution) === "" ? 0 : contribution,
          });
        }}
      >
        {({ isSubmitting }) => (
          <>
            <Field name="name" label="Name" placeholder="The name you go by." />
            <Field
              name="firstName"
              label="First Name"
              placeholder="(In basic Latin.)"
            />
            <Field
              name="lastName"
              label="Last Name"
              placeholder="(In basic Latin.)"
            />
            <Field as={Textarea} name="bio" label="Short Bio" />
            <Field
              as={FileUpload}
              name="photo"
              label="Face Photo"
              accept="image/png, image/jpeg"
              maxSize={1}
              photo
            />
            <Card
              variant="muted"
              sx={{ marginBottom: 2 }}
              header="Photo Instructions:"
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
              accept="video/webm, video/mp4"
              maxSize={3}
              video
            />
            <Card
              variant="muted"
              sx={{ marginBottom: 2 }}
              header="Video Instructions:"
            >
              <List>
                <ListItem>
                  The sign should display in a readable manner the full Ethereum
                  address of the submitter (No ENS; no ellipsis). The sign can
                  be a screen. The submitter must show the sign in the right
                  orientation to be read on the video.
                </ListItem>
                <ListItem>
                  The submitter must say « I certify that I am a real human and
                  that I am not already registered in this registry ».
                  Submitters should speak in their normal voice.
                </ListItem>
                <ListItem>
                  The video quality should be at least 360p, at most 2 minutes
                  long, and in the webm or MP4 format. Lighting conditions and
                  recording device quality should be sufficient to discern
                  facial features and characters composing the Ethereum address
                  displayed.
                </ListItem>
                <ListItem>
                  The quality of the audio should be high enough such that the
                  speaker can be understood clearly.
                </ListItem>
                <ListItem>
                  The face of the submitter should follow the same requirements
                  than for the photo
                </ListItem>
              </List>
            </Card>
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
                <Text>{metaEvidence && "Primary Document"}</Text>
              </Link>
            </Card>
            <Button type="submit" loading={isSubmitting || !isGraphSynced}>
              Submit
            </Button>
            <Text sx={{ marginTop: 1 }}>
              Remember to subscribe to email notifications in Account &gt;
              Notifications to be notified of status changes and any potential
              challenge raised against your registration.
            </Text>
            <UpdateTotalCost totalCost={totalCost} />
            <PersistFormikValues
              name="submit-profile-card-form"
              persistInvalid
            />
          </>
        )}
      </Form>
    </Card>
  );
}
