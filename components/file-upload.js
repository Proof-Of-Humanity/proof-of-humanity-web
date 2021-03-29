import { Trash } from "@kleros/icons";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Box, Flex } from "theme-ui";

import Image from "./image";
import Input from "./input";
import Text from "./text";
import Video from "./video";
import Webcam from "./webcam";

const bufferToString = (buffer) => {
  let string = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++)
    string += String.fromCharCode(bytes[i]);
  return string;
};
const stringToBuffer = (string) => {
  const buffer = new ArrayBuffer(string.length);
  const bufferView = new Uint8Array(buffer);
  for (let i = 0; i < string.length; i++) bufferView[i] = string.charCodeAt(i);
  return buffer;
};
export default function FileUpload({
  value,
  onChange: _onChange,
  name,
  accept,
  acceptLabel,
  maxSize,
  maxSizeLabel,
  multiple = false,
  onBlur,
  placeholder = `Drag your file${multiple ? "s" : ""} or click here to upload.`,
  photo = false,
  video = false,
  ...rest
}) {
  const [files, setFiles] = useState(value);
  const onChange = (_files, ...args) => {
    if (_files)
      for (const file of Array.isArray(_files) ? _files : [_files])
        file.toJSON = () => ({
          isSerializedFile: true,
          type: file.type,
          name: file.name,
          content: bufferToString(file.content),
        });
    return _onChange
      ? _onChange({ target: { name, value: _files } })
      : setFiles(_files, ...args);
  };

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
    multiple,
    accept,
    maxSize,
    ...rest,
  });

  useEffect(() => {
    if (value) {
      const _files = Array.isArray(value) ? value : [value];
      if (_files.some((file) => file.isSerializedFile)) {
        const parsedFiles = _files.map((file) => {
          if (!file.isSerializedFile) return file;

          const buffer = stringToBuffer(file.content);
          file = new File([buffer], file.name, { type: file.type });
          file.preview = URL.createObjectURL(file);
          file.content = buffer;
          file.toJSON = () => ({
            isSerializedFile: true,
            type: file.type,
            name: file.name,
            content: bufferToString(file.content),
          });
          return file;
        });
        _onChange({ target: { name, value: parsedFiles } });
      }
    }
  }, [value, _onChange, name]);
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
        {maxSizeLabel && acceptLabel ? (
          <Text sx={{ fontStyle: "italic" }}>
            (Max Size: {maxSizeLabel} | {acceptLabel})
          </Text>
        ) : maxSizeLabel ? (
          <Text sx={{ fontStyle: "italic" }}>(Max Size: {maxSizeLabel})</Text>
        ) : acceptLabel ? (
          <Text sx={{ fontStyle: "italic" }}>{acceptLabel}</Text>
        ) : null}
        <Text>{placeholder}</Text>
      </Box>
      <Flex sx={{ marginTop: 1 }}>
        {files &&
          (Array.isArray(files) ? files : [files])
            .filter((file) => !file.isSerializedFile)
            .map((file) => (
              <Box
                key={file.path || file.name}
                sx={{
                  marginTop: 1,
                  position: "relative",
                  width: "fit-content",
                }}
              >
                {file.type.startsWith("video") ? (
                  <Video variant="thumbnail" url={file.preview} />
                ) : file.type.startsWith("image") ? (
                  <Image variant="thumbnail" src={file.preview} />
                ) : (
                  <Text>{file.name}</Text>
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
      </Flex>
      {photo || video ? (
        <Webcam
          photo={photo}
          onChange={(file) => onChange(multiple ? [...files, file] : file)}
          video={video}
          mirrored={false}
        />
      ) : null}
    </Box>
  );
}
