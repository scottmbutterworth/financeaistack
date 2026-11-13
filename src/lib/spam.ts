const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.biz",
  "guerrillamail.de",
  "guerrillamailblock.com",
  "grr.la",
  "sharklasers.com",
  "guerrillamail.info",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "10minutemail.com",
  "10minutemail.net",
  "tempmail.com",
  "temp-mail.org",
  "tempmailo.com",
  "trashmail.com",
  "trashmail.de",
  "trash-mail.com",
  "discard.email",
  "discardmail.com",
  "fakeinbox.com",
  "getnada.com",
  "nada.email",
  "maildrop.cc",
  "mailnesia.com",
  "mintemail.com",
  "mohmal.com",
  "emailondeck.com",
  "dispostable.com",
  "throwawaymail.com",
  "tmpmail.org",
  "tmpmail.net",
  "tempinbox.com",
  "burnermail.io",
  "mailcatch.com",
  "spam4.me",
  "spamgourmet.com",
  "mailnull.com",
  "inboxkitten.com",
  "getairmail.com",
  "dropmail.me",
  "mytemp.email",
  "tempmail.plus",
  "moakt.com",
  "linshiyouxiang.net",
  "guerrillamailblock.com",
  "pokemail.net",
  "spam.la",
  "trashmail.org",
  "mailforspam.com",
  "spambox.us",
  "tempr.email",
  "discardmail.de",
  "mailexpire.com",
  "mailinator.net",
  "mailinator.org",
  "safetymail.info",
  "filzmail.com",
  "jetable.org",
  "trashymail.com",
  "thankyou2010.com",
  "trash2009.com",
  "mt2014.com",
  "mt2015.com",
  "wegwerfemail.de",
  "einrot.com",
  "byom.de",
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "test.test",
  "localhost",
  "invalid",
]);

const FAKE_LOCALS = new Set([
  "test",
  "testing",
  "fake",
  "asdf",
  "asdfasdf",
  "qwerty",
  "abc",
  "aaa",
  "abc123",
  "user",
  "username",
  "name",
  "email",
  "null",
  "void",
  "spam",
  "noreply",
  "no-reply",
  "foo",
  "bar",
  "baz",
  "admin",
]);

const EMAIL_RE = /^[a-z0-9._%+-]{2,}@[a-z0-9.-]+\.[a-z]{2,}$/i;

export function normaliseEmail(input: string) {
  return input.trim().toLowerCase();
}

export function emailRejection(input: string): string | null {
  const email = normaliseEmail(input);
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return "Enter a real email address.";
  }

  const [local, domain] = email.split("@");
  if (!local || !domain) return "Enter a real email address.";

  if (
    domain === "test.com" ||
    domain === "example.com" ||
    domain === "example.org" ||
    domain === "example.net" ||
    domain.endsWith(".test") ||
    domain.endsWith(".invalid") ||
    domain.endsWith(".example") ||
    domain.endsWith(".localhost")
  ) {
    return "That address looks like a test address.";
  }

  if (DISPOSABLE_DOMAINS.has(domain) || /tempmail|trashmail|mailinator|yopmail|guerrillamail|10minute/.test(domain)) {
    return "Use a work or personal address. Disposable inboxes are blocked.";
  }

  const localKey = local.split("+")[0]?.replace(/\./g, "") ?? local;
  if (FAKE_LOCALS.has(local) || FAKE_LOCALS.has(localKey)) {
    return "That address looks like a placeholder.";
  }

  if (/^(.)\1{4,}$/.test(localKey) || /^(asdf|qwer|zxcv|test|fake)/.test(localKey)) {
    return "That address looks like a placeholder.";
  }

  return null;
}
