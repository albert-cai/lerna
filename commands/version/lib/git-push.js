"use strict";

const log = require("npmlog");
const childProcess = require("@lerna/child-process");

module.exports = gitPush;

function gitPush(remote, branch, opts) {
  log.silly("gitPush", remote, branch);

  return childProcess
    .exec("git", ["push", "--follow-tags", "--no-verify", "--atomic", remote, branch], opts)
    .catch(error => {
      // @see https://github.com/sindresorhus/execa/blob/v1.0.0/index.js#L159-L179
      // the error message _should_ be on stderr, but I don't trust Windows to do anything right
      if (/fatal:(.*)--atomic/.test(error.message)) {
        // --atomic is only supported in git >=2.4.0, which some crusty CI environments deem unnecessary to upgrade.
        // so let's try again without attempting to pass an option that is almost 5 years old as of this writing...
        log.warn("gitPush", "failed to pass --atomic (unsupported by remote), attempting non-atomic push");
        log.verbose("", error.message);

        return childProcess.exec("git", ["push", "--follow-tags", "--no-verify", remote, branch], opts);
      }

      // ensure unexpected errors still break chain
      throw error;
    });
}
