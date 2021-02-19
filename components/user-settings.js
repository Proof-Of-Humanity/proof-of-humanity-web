import { useCallback, useMemo, useState } from "react";

import { createDerivedAccountAPIs } from "./archon-provider";
import Button from "./button";
import Checkbox from "./checkbox";
import Divider from "./divider";
import Form, { Field } from "./form";
import Text from "./text";

export default function UserSettings({
  userSettingsURL,
  settings,
  parseSettings,
  normalizeSettings,
}) {
  const {
    useAPIs: {
      getUserSettings: useUserSettings,
      patchUserSettings: usePatchUserSettings,
    },
  } = useMemo(
    () =>
      createDerivedAccountAPIs(
        [
          {
            name: "getUserSettings",
            method: "GET",
            URL: userSettingsURL,
            payloadKey: "settings",
          },
          {
            name: "patchUserSettings",
            method: "PATCH",
            URL: userSettingsURL,
            payloadKey: "settings",
          },
        ],
        userSettingsURL
      ),
    [userSettingsURL]
  );

  const [userSettings] = useUserSettings(
    useMemo(
      () => ({
        ...Object.keys(settings).reduce((acc, setting) => {
          acc[setting] = true;
          return acc;
        }, {}),
        email: true,
      }),
      [settings]
    )
  );
  const { send } = usePatchUserSettings();
  const [message, setMessage] = useState();
  return (
    <Form
      enableReinitialize
      initialValues={useMemo(() => parseSettings(userSettings), [
        parseSettings,
        userSettings,
      ])}
      createValidationSchema={useCallback(
        ({ boolean, string }) => ({
          ...Object.keys(settings).reduce((acc, setting) => {
            acc[setting] = boolean();
            return acc;
          }, {}),
          email: string().email("Must be a valid email.").required("Required"),
        }),
        [settings]
      )}
      onSubmit={async (_settings) => {
        setMessage("");
        await send(normalizeSettings(_settings));
        setMessage("Changes saved.");
      }}
    >
      {({ isSubmitting }) => (
        <>
          {Object.keys(settings).map((setting) => (
            <Field
              key={setting}
              as={Checkbox}
              name={setting}
              {...settings[setting]}
            />
          ))}
          <Field name="email" label="Email" />
          <Divider />
          <Button
            sx={{
              display: "block",
              marginTop: -2,
              marginX: "auto",
            }}
            type="submit"
            loading={isSubmitting}
          >
            Save
          </Button>
          {message && (
            <Text
              sx={{
                bottom: 1,
                color: "success",
                fontSize: 12,
                position: "absolute",
                right: 1,
              }}
            >
              {message}
            </Text>
          )}
        </>
      )}
    </Form>
  );
}
