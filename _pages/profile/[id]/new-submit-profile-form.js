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

function sanitizeVideo(video) {}

function sanitizePhoto(photo) {}

export function NewSubmitProfileForm() {
    return (<Form createValidationSchema={
        useCallback(({string, file, eth, web3: _web3}) => {
            const schema = {
                    photo: file().required("Required"),
                    video:file().required("Required"),
                
            }
            return schema;
         } 
        )}> 
         <Field as={FileUpload}
                name="photo"
                label="Face Photo"
                photo/>
                <Field as={FileUpload}
                name="video"
                label="Video"
                video />
        
    </Form>
        )}
    NewSubmitProfileForm.displayName="NewSubmitProfileForm" ; export default NewSubmitProfileForm;
