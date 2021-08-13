import { Camera, Stop, Video as VideoIcon } from "@kleros/icons";
import { useEffect, useRef, useState } from "react";
import ReactLoadingSkeleton from "react-loading-skeleton";
import ReactWebcam from "react-webcam";
import { Box, Flex } from "theme-ui";

import Alert from "./alert";
import Button from "./button";
import Popup from "./popup";
import Text from "./text";

export default function Webcam({
  sx,
  videoConstraints = { height: 480, width: 480 },
  mirrored = true,
  photo = true,
  onChange,
  video = true,
  open = false,
  setPopupOpen,
  ...rest
}) {
  const [file, setFile] = useState();
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [_mirrored, _setMirrored] = useState(mirrored);

  const ref = useRef();
  const mediaRecorderRef = useRef();
  const recordedChunksRef = useRef([]);

  const popupWidth = "65vh";
  const popupMaxHeight = "85vh";
  const popupMinHeight = "65vh";

  useEffect(
    () => () => {
      if (file) URL.revokeObjectURL(file.preview);
    },
    [file]
  );

  return (
    <Popup
      contentStyle={{ width: undefined }}
      modal
      onClose={() => setLoading(true)}
      open={open}
      closeOnDocumentClick={false}
    >
      <Box
        sx={{
          video: {
            height: popupWidth,
            marginBottom: -4,
            width: popupWidth,
          },
          display: "flex",
          flexDirection: "column",
          minHeight: popupMinHeight,
          maxHeight: popupMaxHeight,
          minWidth: popupWidth,
          ...sx,
        }}
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
        }}
      >
        <ReactWebcam
          ref={ref}
          mirrored={_mirrored}
          videoConstraints={videoConstraints}
          onCanPlayThrough={() => setLoading(false)}
          {...rest}
          onClick={(event) => event.preventDefault()}
        />
        <Flex
          sx={{
            bottom: 2,
            justifyContent: "space-evenly",
            left: 0,
            width: "100%",
            mt: 1,
          }}
          onClick={(event) => event.preventDefault()}
        >
          <Button
            preventDefault
            onClick={(event) => {
              event.preventDefault();
              _setMirrored(!_mirrored);
            }}
            disabled={recording}
          >
            Mirror
          </Button>
          {photo && (
            <Button
              preventDefault
              onClick={(event) => {
                event.preventDefault();
                ref.current.getCanvas().toBlob(async (blob) => {
                  const _file = new File([blob], "capture.png", {
                    type: blob.type,
                  });
                  const buffer = await _file.arrayBuffer();
                  _file.preview = URL.createObjectURL(_file);
                  _file.content = buffer;
                  setFile(_file);
                  if (onChange) onChange(_file);
                });
                setPopupOpen(false);
              }}
            >
              <Camera sx={{ marginRight: 1 }} /> Capture
            </Button>
          )}
          {video &&
            (recording ? (
              <Button
                preventDefault
                onClick={(event) => {
                  event.preventDefault();
                  mediaRecorderRef.current.stop();
                  setPopupOpen(false);
                }}
              >
                <Stop sx={{ marginRight: 1 }} /> Stop
              </Button>
            ) : (
              <Button
                onClick={(event) => {
                  event.preventDefault();
                  setRecording(true);
                  ref.current.recording = true;

                  ref.current.getCanvas();
                  if (_mirrored) {
                    ref.current.ctx.translate(ref.current.canvas.width, 0);
                    ref.current.ctx.scale(-1, 1);
                    ref.current.mirrored = true;
                  }

                  const renderFrame = () => {
                    if (ref.current?.recording) {
                      ref.current.ctx.drawImage(
                        ref.current.video,
                        0,
                        0,
                        ref.current.canvas.width,
                        ref.current.canvas.height
                      );
                      requestAnimationFrame(renderFrame);
                    }
                  };
                  requestAnimationFrame(renderFrame);

                  const stream = ref.current.canvas.captureStream();
                  ref.current?.stream
                    .getAudioTracks()
                    .forEach((track) => stream.addTrack(track));
                  mediaRecorderRef.current = new MediaRecorder(stream, {
                    mimeType: "video/webm",
                  });
                  mediaRecorderRef.current.addEventListener(
                    "dataavailable",
                    ({ data }) => {
                      if (data.size > 0)
                        recordedChunksRef.current =
                          recordedChunksRef.current.concat(data);
                    }
                  );
                  mediaRecorderRef.current.addEventListener(
                    "stop",
                    async () => {
                      const _file = new File(
                        recordedChunksRef.current,
                        "video.webm",
                        {
                          type: "video/webm",
                        }
                      );
                      const buffer = await _file.arrayBuffer();
                      _file.preview = URL.createObjectURL(_file);
                      _file.content = buffer;
                      setFile(_file);
                      if (onChange) onChange(_file);

                      if (ref.current?.mirrored) {
                        ref.current.ctx.translate(-ref.current.canvas.width, 0);
                        ref.current.ctx.scale(-1, 1);
                        ref.current.mirrored = false;
                      }

                      recordedChunksRef.current = [];
                      if (ref.current) ref.current.recording = false;
                      setRecording(false);
                    }
                  );
                  mediaRecorderRef.current.start();
                }}
              >
                <VideoIcon sx={{ marginRight: 1 }} /> Record
              </Button>
            ))}
          <Button
            preventDefault
            onClick={(event) => {
              event.persist();
              event.preventDefault();
              setPopupOpen(false);
            }}
            disabled={recording}
          >
            Close
          </Button>
        </Flex>
        {(photo || video) && (
          <Alert
            type="muted"
            title="Important"
            sx={{
              maxWidth: popupWidth,
              maxHeight: `calc(${popupMaxHeight} - ${popupWidth})`,
              mt: 2,
            }}
          >
            <Text>
              {video &&
                `After recording, check in the preview that the address
              is clearly readable, it's not mirrored and that the video complies
              with the rest of the policy.`}
              {photo &&
                `Make sure to directly face the camera, that all your
              facial features are clearly visible, and that the photo complies
              with the rest of the policy.`}
            </Text>
          </Alert>
        )}
        {loading && (
          <Box
            as={ReactLoadingSkeleton}
            sx={{
              left: 0,
              position: "absolute",
              top: 0,
            }}
            height="calc(80vh + 10px)"
            width="calc(80vh + 10px)"
            onClick={(event) => event.preventDefault()}
          />
        )}
      </Box>
    </Popup>
  );
}
