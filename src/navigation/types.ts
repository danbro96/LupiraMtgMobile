// Param lists for typed navigation. Add new screens here as the app grows.
import type { NavigatorScreenParams } from '@react-navigation/native';

export type MtgTabParamList = {
  Search: undefined;
  /** `manualMatch`: a capture resolved in PrintingPicker, handed back so its gallery tile shows as added. */
  Scan: { manualMatch?: { captureId: string; printingId: string; instanceId: string } } | undefined;
  Collections: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Tabs: NavigatorScreenParams<MtgTabParamList>;
  Settings: undefined;
  ScanSettings: undefined;
  ScanDebugLog: undefined;
  CardDetail: { oracleId: string };
  PrintingDetail: { oracleId: string; printingId: string };
  CollectionDetail: { collectionId: string };
  Selection: undefined;
  PickCollection: { selectionId: string };
  PrintingPicker: {
    query?: string;
    oracleId?: string;
    captureId?: string;
    /** Selection entries the picked printing replaces (change printing) instead of adding a new card. */
    replaceInstanceIds?: string[];
    currentPrintingId?: string;
    isFoil?: boolean;
    condition?: string;
    language?: string;
  };
};
