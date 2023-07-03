import { Asset } from '../models/asset.model';

export interface ValidationResultFact {
  asset: string;
  message: string;
}

export interface ValidationResult {
  passed: boolean;
  facts: ValidationResultFact[];
}

export interface SecurityValidator {
  supportsType: (assetType: string) => boolean;
  validate: (asset: Asset) => ValidationResult;
}

export class SecurityGroupsValidator implements SecurityValidator {
  supportsType(assetType: string): boolean {
    return [
      'compute.googleapis.com/Firewall',
      'Microsoft.Network/networkSecurityGroups',
      'AWS::EC2::SecurityGroup',
    ].includes(assetType);
  }

  validate(asset: Asset): ValidationResult {
    switch (asset.type) {
      case 'compute.googleapis.com/Firewall':
        if (
          asset.source.direction === 'INGRESS' &&
          asset.source.sourceRanges.includes('0.0.0.0/0') &&
          asset.source.allowed.find(
            (a: any) => a.IPProtocol && a.IPProtocol === '22'
          )
        ) {
          return {
            passed: false,
            facts: [
              {
                asset: asset.name || asset.id,
                message: `SSH allowed from 0.0.0.0/0 detected`,
              },
            ],
          };
        }
        return { passed: true, facts: [] };
      default:
        return { passed: true, facts: [] };
    }
  }
}
