import { Box } from "theme-ui";
import TimeagoReact from "timeago-react";

import { useTranslation } from 'react-i18next';

import * as timeago from 'timeago.js';
import en from 'node_modules/timeago.js/lib/lang/en_US';
import es from 'node_modules/timeago.js/lib/lang/es';
import pt from 'node_modules/timeago.js/lib/lang/pt_BR';
import fr from 'node_modules/timeago.js/lib/lang/fr';
import it from 'node_modules/timeago.js/lib/lang/it';
import cn from 'node_modules/timeago.js/lib/lang/zh_CN';

timeago.register('en', en);
timeago.register('es', es);
timeago.register('pt', pt);
timeago.register('fr', fr);
timeago.register('it', it);
timeago.register('cn', cn);

export default function TimeAgo(props) {
  let { i18n } = useTranslation();

  return (
    <Box
      as={(boxProps) => <TimeagoReact locale={i18n.resolvedLanguage} {...props} {...boxProps} />}
      {...props}
    />
  );
}
