import { Card, Field, Form, Textarea } from "@kleros/components";

const createValidationSchema = ({ string }) => ({
  name: string().max(50, "Must be 50 characters or less.").required("Required"),
  firstName: string()
    .max(20, "Must be 20 characters or less.")
    .required("Required"),
  lastName: string()
    .max(20, "Must be 20 characters or less.")
    .required("Required"),
  bio: string().max(70, "Must be 70 characters or less.").required("Required"),
});
export default function SubmitProfileCard() {
  return (
    <Card
      header="Submit Profile"
      headerSx={{
        backgroundColor: "accent",
        color: "background",
        fontWeight: "bold",
      }}
    >
      <Form createValidationSchema={createValidationSchema}>
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
      </Form>
    </Card>
  );
}
