export interface Asset {
  /**
   * The ID of the asset/resource given by the provider
   */
  id: string;

  /**
   * The RTI integration (cloud account)
   */
  integration: Integration;

  /**
   * The name of the asset (where available)
   */
  name?: string;

  /**
   * Provider-specific type of the asset.
   * E.g. Microsoft.Compute/virtualMachines for Azure VMs
   */
  type: string;

  /**
   * Provider-specific region where applicable. "global" otherwise
   * E.g. eu-west-1
   */
  region?: string;

  /**
   * RTI-specific version (timestamp)
   */
  version: string;

  /**
   * When the last change was performed
   */
  changeTime: string;

  /**
   * The URL to open the asset in the provider portal.
   */
  // providerUrl: string;

  /**
   * Whether the asset was deleted from the provider.
   */
  deleted: boolean;

  /**
   * The data as received from the provider.
   */
  source?: any;
}

export interface Integration {
  id: string;
  provider: string;
}
