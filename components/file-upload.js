import { Trash } from "@kleros/icons";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Box } from "theme-ui";

import Button from "./button";
import Image from "./image";
import Input from "./input";
import Text from "./text";
import Video from "./video";
import Webcam from "./webcam";

export default function FileUpload({
  value,
  onChange: _onChange,
  name,
  accept,
  maxSize,
  multiple = false,
  onBlur,
  placeholder = `Drag your file${multiple ? "s" : ""} or click here to upload.`,
  photo = false,
  video = false,
  ...rest
}) {
  const [files, setFiles] = useState(value);
  const onChange = _onChange
    ? (_files) => _onChange({ target: { name, value: _files } })
    : setFiles;

  const { getRootProps, getInputProps } = useDropzone({
    async onDrop(acceptedFiles) {
      const readFiles = await Promise.all(
        acceptedFiles.map(async (file) => {
          const buffer = await file.arrayBuffer();
          file.preview = URL.createObjectURL(file);
          file.content = buffer;
          return file;
        })
      );
      const _files = readFiles.length === 1 ? readFiles[0] : readFiles;
      onChange(_files);
    },
    accept,
    maxSize: maxSize * 1e6,
    multiple,
    ...rest,
  });

  useEffect(() => {
    if (value !== undefined && value !== files) setFiles(value);
  }, [value, files]);
  useEffect(
    () => () => {
      if (files)
        (Array.isArray(files) ? files : [files]).forEach((file) =>
          URL.revokeObjectURL(file.preview)
        );
    },
    [files]
  );
  return (
    <Box
      sx={{ position: "relative" }}
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
      }}
    >
      <Box
        {...getRootProps({
          variant: "forms.fileUpload",
          onBlur() {
            if (onBlur) onBlur({ target: { name } });
          },
          ...rest,
        })}
      >
        <Input {...getInputProps()} />
        <Text sx={{ fontStyle: "italic" }}>
          (Max Size: {maxSize}MB | {accept})
        </Text>
        <Text>{placeholder}</Text>
        {files &&
          (Array.isArray(files) ? files : [files]).map((file) => (
            <Box
              key={file.path || file.name}
              sx={{ marginTop: 1, position: "relative", width: "fit-content" }}
            >
              {file.type.startsWith("video") ? (
                <Video variant="thumbnail" url={file.preview} />
              ) : (
                <Image variant="thumbnail" src={file.preview} />
              )}
              <Trash
                sx={{
                  fill: "text",
                  position: "absolute",
                  right: -1,
                  top: -1,
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  onChange(
                    multiple ? files.filter((_file) => _file !== file) : null
                  );
                }}
              />
            </Box>
          ))}
      </Box>
      {(photo || video) && (
        <Webcam
          trigger={
            <Button
              variant="secondary"
              sx={{
                position: "absolute",
                right: 1,
                top: 1,
              }}
            >
              Use Webcam
            </Button>
          }
          photo={photo}
          onChange={(file) => onChange(multiple ? [...files, file] : file)}
          video={video}
        />
      )}
    </Box>
  );
}
