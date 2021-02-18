import * as cdk from '@aws-cdk/core';
import waf = require('@aws-cdk/aws-wafv2');

export interface CDKWafStackProps extends cdk.StackProps{
  gatewayARN: string
}

export class CDKWafStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: CDKWafStackProps) {
    super(scope, id, props);

    /**
     * Setup WAF Rules
     */

    let wafRules:Array<waf.CfnWebACL.RuleProperty>  = [];

    // 1 AWS Managed Rules
    let awsManagedRules:waf.CfnWebACL.RuleProperty  = {
      name: 'AWS-AWSManagedRulesCommonRuleSet',
      priority: 1,
      overrideAction: {none: {}},
      statement: {
        managedRuleGroupStatement: {
          name: 'AWSManagedRulesCommonRuleSet',
          vendorName: 'AWS',
          excludedRules: [{name: 'SizeRestrictions_BODY'}]
        }
      },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'awsCommonRules',
        sampledRequestsEnabled: true
      }
    };

    wafRules.push(awsManagedRules);

    // 2 AWSManaged Rules SQLi Rule Set
    let awsSQLRules:waf.CfnWebACL.RuleProperty  = {
        name: 'AWS-AWSManagedRulesSQLiRuleSet',
        priority: 2,
        overrideAction: {none: {}},
        statement: {
        managedRuleGroupStatement: {
            name: 'AWSManagedRulesSQLiRuleSet',
            vendorName: 'AWS'
            }
        },
        visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'awsSQLRules',
        sampledRequestsEnabled: true
        }
    };

    wafRules.push(awsSQLRules);

    /**
     * Create and Associate ACL with Gateway
     */

    // Create our Web ACL
    let webACL = new waf.CfnWebACL(this, 'WebACL', {
      defaultAction: {
        allow: {}
      },
      scope: 'REGIONAL',
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'webACL',
        sampledRequestsEnabled: true
      },
      rules: wafRules
    });

    // Associate with our gateway
    new waf.CfnWebACLAssociation(this, 'WebACLAssociation', {
      webAclArn: webACL.attrArn,
      resourceArn: props.gatewayARN
    })
  }
}