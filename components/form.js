import { ErrorMessage, Formik, Field as _Field, Form as _Form } from "formik";
import { useMemo } from "react";
import { Box } from "theme-ui";
import { object, string } from "yup";

import Input from "./input";
import Label from "./label";
import Text from "./text";

export default function Form({
  createValidationSchema,
  sx,
  children,
  ...rest
}) {
  const validationSchema = useMemo(
    () =>
      object(createValidationSchema({ string: () => string().default("") })),
    [createValidationSchema]
  );
  return (
    <Formik
      initialValues={validationSchema.default()}
      validationSchema={validationSchema}
      {...rest}
    >
      <Box as={_Form} variant="form" sx={sx}>
        {children}
      </Box>
    </Formik>
  );
}

export function Field({ label, as = Input, name, ...rest }) {
  return (
    <Label>
      {label}
      <_Field as={as} name={name} {...rest} />
      <Text variant="forms.field.error">
        <ErrorMessage name={name} />
      </Text>
    </Label>
  );
}
