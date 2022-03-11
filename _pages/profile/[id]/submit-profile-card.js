import {
  Box,
  Card,
  Progress,
  Text,
  useContract,
  useWeb3,
} from "@kleros/components";
import { useCallback, useMemo, useState } from "react";
import { graphql, useFragment } from "relay-hooks";

import NewSubmitProfileForm from "./submit-profile/new-submit-profile-form";

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

function useUploadProgress() {
  const [uploadProgress, _doSetUploadProgress] = useState(0);
  const setUploadProgress = useCallback((event) => {
    _doSetUploadProgress((current) =>
      !current
        ? {
            loaded: event.loaded,
            total: event.total,
          }
        : {
            loaded:
              event.loaded > current.loaded ? event.loaded : current.loaded,
            total: current.total,
          }
    );
  }, []);

  return [uploadProgress, setUploadProgress];
}

function UploadProgress({ total, loaded, label, successLabel, sx }) {
  return (
    <Box sx={{ ...sx }}>
      {loaded >= total ? successLabel : label}
      <Progress
        max={total ?? 1}
        value={loaded ?? 0}
        color={loaded >= total ? "success" : "primary"}
      />
    </Box>
  );
}

function useRegistrationParameters({ contract, submission }) {
  const submissionName = submission?.name || "";

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

  return useMemo(
    () => ({
      submissionName,
      registrationMetaEvidence,
      totalCost,
    }),
    [submissionName, registrationMetaEvidence, totalCost]
  );
}

export default function SubmitProfileCard({
  contract,
  submission,
  reapply,
  afterSend = () => {},
  afterSendError = () => {},
}) {
  const [photoUploadProgress, handlePhotoUploadProgress] = useUploadProgress();
  const [videoUploadProgress, handleVideoUploadProgress] = useUploadProgress();
  const [submissionUploadProgress, handleSubmissionUploadProgress] =
    useUploadProgress();
  const [waitingForTransaction, setWaitingForTransaction] = useState(false);

  const { submissionName, registrationMetaEvidence, totalCost } =
    useRegistrationParameters({
      contract,
      submission,
    });

  return (
    <Card
      header="Submit Profile"
      headerSx={{
        backgroundColor: "accent",
        color: "background",
        fontWeight: "bold",
      }}
    >
      <Box>
        <NewSubmitProfileForm />
        {videoUploadProgress || photoUploadProgress ? (
          <Card
            variant="muted"
            sx={{ my: 1 }}
            mainSx={{
              flexDirection: "column",
              gap: 3,
            }}
          >
            <UploadProgress
              total={photoUploadProgress?.total}
              loaded={photoUploadProgress?.loaded}
              label={<Text sx={{ fontSize: 0 }}>Uploading photo...</Text>}
              successLabel={<Text sx={{ fontSize: 0 }}>Photo uploaded!</Text>}
              sx={{ width: "100%" }}
            />
            <UploadProgress
              total={videoUploadProgress?.total}
              loaded={videoUploadProgress?.loaded}
              label={<Text sx={{ fontSize: 0 }}>Uploading video...</Text>}
              successLabel={<Text sx={{ fontSize: 0 }}>Video uploaded!</Text>}
              sx={{ width: "100%" }}
            />
            {videoUploadProgress?.loaded && photoUploadProgress?.loaded ? (
              <UploadProgress
                total={submissionUploadProgress?.total}
                loaded={submissionUploadProgress?.loaded}
                label={
                  <Text sx={{ fontSize: 0 }}>Uploading full submission...</Text>
                }
                successLabel={
                  <Text sx={{ fontSize: 0 }}>Submission uploaded!</Text>
                }
                sx={{ width: "100%" }}
              />
            ) : null}
            {waitingForTransaction ? (
              <Text> Waiting for your submission to be mined... </Text>
            ) : null}
          </Card>
        ) : null}
      </Box>
    </Card>
  );
}
