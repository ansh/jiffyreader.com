import { envService } from './envService';
import Logger from './Logger';

export enum EventCategory {
	APP_EVENT = 'APP_EVENT',
	INTERNAL_CODE_EVENT = 'INTERNAL_CODE_EVENT',
	USER_EVENT = 'USER_EVENT',
}

function trackEvent(
	eventData: { eventCategory: EventCategory; eventName: string; eventType: string; [key: string]: any },
	appData = { browser: envService.PLASMO_TARGET, version: envService.PLASMO_VERSION },
	date = new Date(),
	enableTracking = envService.PLASMO_ENABLE_TRACKING,
) {
	Logger.logInfo({ enableTracking });
	if (!enableTracking) {
		return;
	}

	const params = new URLSearchParams({ ...{ time: date.toString(), time_iso: date.toISOString(), ...eventData }, ...appData });
	Logger.logInfo('track-event', params.toString());
	return fetch(envService.PLASMO_HOME_URL ?? 'https://jiffyreader.com' + `/track-event?${params.toString()}`);
}

const TrackEventService = {
	trackEvent,
};

export default TrackEventService;
