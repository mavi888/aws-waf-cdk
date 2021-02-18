#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkAuroraServerlessStack } from '../lib/cdk-aurora-serverless-stack';
import { CDKWafStack} from '../lib/cdk-waf-stack';

const app = new cdk.App();

const apiGatewayStack = new CdkAuroraServerlessStack(app, 'CdkAuroraServerlessStack');

const cdkwafStack = new CDKWafStack(app, 'CdkWafStack', {
    gatewayARN: apiGatewayStack.apiGatewayARN
});

cdkwafStack.addDependency(apiGatewayStack);
