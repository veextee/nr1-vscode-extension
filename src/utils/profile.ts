const fs = require("fs");
const os = require("os");

export const getProfiles = () => {
  const credentialPath = `${os.homedir()}/.newrelic/credentials.json`;
  return JSON.parse(fs.readFileSync(credentialPath));
};

export const getCurrentProfile = () => {
  const defaultPath = `${os.homedir()}/.newrelic/default-profile.json`;
  return JSON.parse(fs.readFileSync(defaultPath));
};
