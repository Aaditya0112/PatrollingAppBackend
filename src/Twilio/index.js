// Download the helper library from https://www.twilio.com/docs/node/install
import twilio from "twilio" // Or, for ESM: import twilio from "twilio";

// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);


const service = await client.verify.v2.services.create({
    defaultTemplateSid:"HJd2847507a6104c1622eaccf1f949af7d",
    friendlyName: "policeApp Verify Service",
});


//   const templates = await client.verify.v2.templates.list({ limit: 20 });

//   templates.forEach((t) => console.log(t));




async function createVerification(countryCode, number) {
    const verification = await client.verify.v2
        .services(service.sid)
        .verifications.create({
            channel: "sms",
            to:`${countryCode}${number}`,
        });

    return verification
}

async function createVerificationCheck(countryCode = "+91", otp, number) {
    const verificationCheck = await client.verify.v2
        .services(service.sid)
        .verificationChecks.create({
            code: otp,
            to: `${countryCode}${number}`,
        });

    return verificationCheck.status;
}

export {
    createVerification,
    createVerificationCheck
}