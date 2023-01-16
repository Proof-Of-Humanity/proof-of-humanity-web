import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
      initialValues={useMemo(
        () => parseSettings(userSettings),
        [parseSettings, userSettings]
      )}
      createValidationSchema={useCallback(
        ({ boolean, string }) => ({
          ...Object.keys(settings).reduce((acc, setting) => {
            acc[setting] = boolean();
            return acc;
          }, {}),
          email: string()
            .email(t("header_notifications_valid_email"))
            .required(t("header_notifications_email_required")),
        }),
        [settings, t]
      )}
      onSubmit={async (_settings) => {
        setMessage("");
        await send(normalizeSettings(_settings));
        setMessage(t("header_notifications_changes_saved"));
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
          <Divider sx={{ opacity: 0 }} />
          <Button
            className="poh-button"
            sx={{ display: "block", marginTop: -2, marginX: "auto" }}
            type="submit"
            loading={isSubmitting}
          >
            {t("header_notifications_save")}
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
