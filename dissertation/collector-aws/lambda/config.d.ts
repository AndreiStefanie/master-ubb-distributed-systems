export type ChangeType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface Detail {
  recordVersion: string;
  messageType: string;
  configurationItemDiff?: ConfigurationItemDiff;
  notificationCreationTime: Date;
  configurationItem?: ConfigurationItem;
}

export interface ConfigurationItemDiff {
  changedProperties: ChangedProperties;
  changeType: ChangeType;
}

export interface ChangedProperties {
  [prop: string]: Change;
}

export interface Change {
  previousValue: null | any;
  updatedValue: null | any;
  changeType: ChangeType;
}

export interface ConfigurationItem {
  relatedEvents: any[];
  relationships: any[];
  configuration: Configuration;
  supplementaryConfiguration: SupplementaryConfiguration;
  tags: Tags;
  configurationItemVersion: string;
  configurationItemCaptureTime: Date;
  configurationStateId: number;
  awsAccountId: string;
  configurationItemStatus: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  ARN: string;
  awsRegion: string;
  availabilityZone: string;
  configurationStateMd5Hash: string;
}

export type Configuration = any;

export type SupplementaryConfiguration = any;

export interface Tags {
  [key: string]: string;
}
