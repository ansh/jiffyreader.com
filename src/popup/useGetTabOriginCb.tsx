import { useCallback } from 'react';
import TabHelper from '~services/TabHelper';

export const useGetTabOriginCb = () => useCallback(async () => await TabHelper.getTabOrigin(await TabHelper.getActiveTab(true)), [TabHelper]);
