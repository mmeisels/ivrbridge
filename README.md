# Release for the IVR Bridge Blog

This is the github repo on how to build a signalling app with Twilio for PSTN.

> A [Twilio account](www.twilio.com/referral/7UItUk) is required to run this application.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/mmeisels/ivrbridge/ivrbridge.git

# Go inside the directory
cd ivrbridge

You will need to set up the environment variables below also.


```

### Set environment files

Rename `.example.env` to `.env`. Follow the instructions below to set your environment variables.

| Variable Name            | Where to get it                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ACCOUNT_SID`       | Find your account Sid in the Project Info pane in the [Console](https://www.twilio.com/console).                                                                                       |                                                                        |                                                               |
| `AUTH_TOKEN`           | Create an API Key via the [REST API](https://www.twilio.com/docs/iam/keys/api-key-resource) or [Console](https://www.twilio.com/console/runtime/api-keys).          |
| `TWILIO_SYNC_SID`        | Create a Sync Service Sid via the [REST API](https://www.twilio.com/docs/sync/api/service) or [Console](https://www.twilio.com/console/sync/services).              |
| `TWILIO_SYNC_POOL_SID`        | This is for your Pool Numbers - Create a Sync Service Map via the [REST API](https://www.twilio.com/docs/sync/api/service) or [Console](https://www.twilio.com/console/sync/services).   |
| `TWILIO_SYNC_RESERVE_SID`        | This is for your Reserved Numbers - Create a Sync Service Map via the [REST API](https://www.twilio.com/docs/sync/api/service) or [Console](https://www.twilio.com/console/sync/services).   |
| `URL`        | This is where the call will be redirected with the TWIML Redirect  |
| `TaskRouterWorkSpace`        | This is the TaskRouter. Create the TaskRouter through the console or API https://www.twilio.com/docs/taskrouter/api/workspace |
| `TaskRouterWorkFlow`        | This is Taskrouter Workflow  |
| `addressSID`        | This is address ID for regulator bundle  |
| `bundleSID`        | This is the bundle SID for the governance and bundle  |
| `TTL`        | This is the TTL to check for the call health in taskrouter task  |
| `incomingFunction`        | This is the internal function that will be used on the new numbers webhook  |
| `newNumberName`        | This is what we will call the numbers when we automatically provision this  |
| `debugEnabled`        | Wether Debug details will be spoken back  |

# Deploying the application

1. Type `twilio serverless:deploy` in Terminal
