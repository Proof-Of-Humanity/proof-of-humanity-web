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
    useWeb3
} from "@kleros/components";
import {useField} from "formik";

import {memo, useCallback, useEffect, useRef} from "react";
const VIDEO_OPTIONS = {
    types: {
      value: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/x-matroska"],
      label: "*.mp4, *.webm, *.avi, *.mov, *.mkv",
    },
    size: {
      value: 15 * 1024 * 1024,
      label: "15 MB",
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
function sanitizeVideo(video) {}

function sanitizePhoto(photo) {}

export function NewSubmitProfileForm() {
    return (
        <Form createValidationSchema={
            useCallback(({string, file, eth, web3: _web3}) => {
                const schema = {
                    photo: file().required("Required"),
                    video: file().required("Required")

                }
                return schema;
            })
        }>
            <Field as={FileUpload}
                name="photo"
                label="Face Photo"
                photo
                accept={
                    PHOTO_OPTIONS.types.value
                }
                acceptLabel={
                    PHOTO_OPTIONS.types.label
                }
                maxSizeLabel={
                    PHOTO_OPTIONS.size.label
                }/>
            <Field as={FileUpload}
                name="video"
                label="Video"
                video
                accept={
                    VIDEO_OPTIONS.types.value
                }
                acceptLabel={
                    VIDEO_OPTIONS.types.label
                }
                maxSizeLabel={
                    VIDEO_OPTIONS.size.label
                }/>

        </Form>
    )
}
NewSubmitProfileForm.displayName = "NewSubmitProfileForm";
export default NewSubmitProfileForm;
