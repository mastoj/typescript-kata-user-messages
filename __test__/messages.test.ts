import { format } from "date-fns";
import { nb, enUS } from "date-fns/locale";
type GeneralError = { code: "generalError" };
type InvalidWeekday = { code: "invalidWeekday"; weekday: string };
type InvalidEmailDomain = {
  code: "invalidEmailDomain";
  email: string;
  validDomains: string[];
};
type TooLateToAppologize = { code: "tooLateToAppologize"; date: Date };
type ErrorType =
  | GeneralError
  | InvalidWeekday
  | InvalidEmailDomain
  | TooLateToAppologize;
type Language = "en" | "no";

interface Translations {
  generalError: string;
  invalidWeekday: (error: InvalidWeekday) => string;
  invalidEmailDomain: (error: InvalidEmailDomain) => string;
  tooLateToAppologize: (error: TooLateToAppologize) => string;
}

const joinStrings = (strings: string[], separator: string) => {
  if (strings.length <= 2) {
    return strings.join(` ${separator} `);
  }
  const last = strings.pop();
  return `${strings.join(", ")} ${separator} ${last}`;
};

const norwegian: Translations = {
  generalError: "En feil har oppstått",
  invalidWeekday: (error: InvalidWeekday) =>
    `"${error.weekday}" er ikke en gyldig ukedag`,
  invalidEmailDomain: (error: InvalidEmailDomain) =>
    `E-postadressen ${error.email} må ha domene ${joinStrings(
      error.validDomains,
      "eller"
    )}`,
  tooLateToAppologize: (error: TooLateToAppologize) =>
    `Det er for sent å beklage på ${format(error.date, "PPP", {
      locale: nb,
    })}`,
};

const english: Translations = {
  generalError: "An error has occurred",
  invalidWeekday: (error: InvalidWeekday) =>
    `"${error.weekday}" is not a valid weekday`,
  invalidEmailDomain: (error: InvalidEmailDomain) =>
    `The email address ${error.email} must have domain ${joinStrings(
      error.validDomains,
      "or"
    )}`,
  tooLateToAppologize: (error: TooLateToAppologize) =>
    `It's too late to appologize on ${format(error.date, "PPP", {
      locale: enUS,
    })}`,
};

const translationsLookup = {
  en: english,
  no: norwegian,
};

const showMessage = (language: Language, errorType: ErrorType) => {
  const translations = translationsLookup[language];
  switch (errorType.code) {
    case "generalError":
      return translations.generalError;
    case "invalidWeekday":
      return translations.invalidWeekday(errorType);
    case "invalidEmailDomain":
      return translations.invalidEmailDomain(errorType);
    case "tooLateToAppologize":
      return translations.tooLateToAppologize(errorType);
    default:
      throw new Error("Unknown error code");
  }
};

describe("translations", () => {
  it("shows message in english", () => {
    expect(
      showMessage("en", {
        code: "generalError",
      })
    ).toBe("An error has occurred");
  });

  it("shows message in norwegian", () => {
    expect(
      showMessage("no", {
        code: "generalError",
      })
    ).toBe("En feil har oppstått");
  });

  it("shows correct invalid weekday with argument", () => {
    expect(
      showMessage("en", {
        code: "invalidWeekday",
        weekday: "HappyDay",
      })
    ).toBe('"HappyDay" is not a valid weekday');
  });

  it("shows correct invalid weekday with argument in norwegian", () => {
    expect(
      showMessage("no", {
        code: "invalidWeekday",
        weekday: "HappyDay",
      })
    ).toBe('"HappyDay" er ikke en gyldig ukedag');
  });

  it("shows a message with an array argument", () => {
    expect(
      showMessage("en", {
        code: "invalidEmailDomain",
        email: "test@invalid.now",
        validDomains: ["valid.com", "valid.no"],
      })
    ).toBe(
      "The email address test@invalid.now must have domain valid.com or valid.no"
    );
  });

  it("shows comma between items for long arrays except the last", () => {
    expect(
      showMessage("en", {
        code: "invalidEmailDomain",
        email: "test@invalid.now",
        validDomains: ["valid.com", "valid.no", "also.valid.com"],
      })
    ).toBe(
      "The email address test@invalid.now must have domain valid.com, valid.no or also.valid.com"
    );
  });

  it("shows single item argument", () => {
    expect(
      showMessage("no", {
        code: "invalidEmailDomain",
        email: "test@invalid.now",
        validDomains: ["valid.com"],
      })
    ).toBe("E-postadressen test@invalid.now må ha domene valid.com");
  });

  it("shows correct format for english date", () => {
    expect(
      showMessage("en", {
        code: "tooLateToAppologize",
        date: new Date("2020-01-01"),
      })
    ).toBe("It's too late to appologize on January 1st, 2020");
  });

  it("shows correct format for norwegian date", () => {
    expect(
      showMessage("no", {
        code: "tooLateToAppologize",
        date: new Date("2020-01-01"),
      })
    ).toBe("Det er for sent å beklage på 1. januar 2020");
  });
});
