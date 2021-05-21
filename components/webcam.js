import { Camera, Stop, Video as VideoIcon } from "@kleros/icons";
import { useEffect, useRef, useState } from "react";
import ReactLoadingSkeleton from "react-loading-skeleton";
import ReactWebcam from "react-webcam";
import { Box, Flex } from "theme-ui";

import Button from "./button";
import Image from "./image";
import Popup from "./popup";
import Video from "./video";

export default function Webcam({
  trigger,
  sx,
  videoConstraints = { height: 360, width: 360 },
  mirrored = true,
  photo = true,
  onChange,
  video = true,
  ...rest
}) {
  const [file, setFile] = useState();
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);

  const ref = useRef();
  const mediaRecorderRef = useRef();
  const recordedChunksRef = useRef([]);

  useEffect(
    () => () => {
      if (file) URL.revokeObjectURL(file.preview);
    },
    [file]
  );
  return (
    <Popup
      contentStyle={{ width: undefined }}
      trigger={trigger}
      modal
      onClose={() => setLoading(true)}
    >
      <Box
        sx={{
          video: {
            height: "80vh",
            marginBottom: -1,
            width: "80vh",
          },
          ...sx,
        }}
      >
        <ReactWebcam
          ref={ref}
          mirrored={mirrored}
          videoConstraints={videoConstraints}
          onCanPlayThrough={() => setLoading(false)}
          {...rest}
        />
        <Flex
          sx={{
            bottom: 2,
            justifyContent: "space-evenly",
            left: 0,
            position: "absolute",
            width: "100%",
          }}
        >
          {photo && (
            <Button
              onClick={() =>
                ref.current.getCanvas().toBlob(async (blob) => {
                  const _file = new File([blob], "capture", {
                    type: blob.type,
                  });
                  const buffer = await _file.arrayBuffer();
                  _file.preview = URL.createObjectURL(_file);
                  _file.content = buffer;
                  setFile(_file);
                  if (onChange) onChange(_file);
                })
              }
            >
              <Camera sx={{ marginRight: 1 }} /> Capture
            </Button>
          )}
          {video &&
            (recording ? (
              <Button onClick={() => mediaRecorderRef.current.stop()}>
                <Stop sx={{ marginRight: 1 }} /> Stop
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setRecording(true);
                  ref.current.recording = true;

                  ref.current.getCanvas();
                  if (mirrored) {
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
                        "video",
                        {
                          type: recordedChunksRef.current[0].type,
                        }
                      );
                      const buffer = await _file.arrayBuffer();
                      _file.preview = URL.createObjectURL(_file);
                      _file.content = buffer;
                      setFile(_file);
                      if (onChange) onChange(_file);

                      if (ref.current.mirrored) {
                        ref.current.ctx.translate(-ref.current.canvas.width, 0);
                        ref.current.ctx.scale(-1, 1);
                        ref.current.mirrored = false;
                      }

                      recordedChunksRef.current = [];
                      ref.current.recording = false;
                      setRecording(false);
                    }
                  );
                  mediaRecorderRef.current.start();
                }}
              >
                <VideoIcon sx={{ marginRight: 1 }} /> Record
              </Button>
            ))}
        </Flex>
        {file &&
          !recording &&
          (file.type.startsWith("video") ? (
            <Video
              variant="thumbnail"
              sx={{
                position: "absolute",
                right: 1,
                top: 1,
              }}
              url={file.preview}
            />
          ) : (
            <Image
              variant="thumbnail"
              sx={{
                position: "absolute",
                right: 1,
                top: 1,
              }}
              src={file.preview}
            />
          ))}
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
          />
        )}
      </Box>
    </Popup>
  );
}
