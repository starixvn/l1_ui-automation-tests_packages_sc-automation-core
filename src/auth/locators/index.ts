export enum LobbyLocator {
    memberIdInput = "input[type='number']",
    tokenBtn = "text=Get Token",
    tokenInput = "input[id=token]",
    ssoLink = "a:has-text('token')",
    advancelbl = "text=Advance",
    langDropdown = "id=language",
    vnLangOption = "vi-VN",
    allLangOption = "vi-VN", //If languague option = all, do test for Vietnamese first
    enLangOption = "en-US",
    thLangOption = "th-TH",
    idLangOption = "id-ID",
    cnLangOption = "zh-CN",
    twLangOption = "zh-TW",
}

export enum SITLocator {
    memberIdInput = "id=txtID",
    pwdInput = "id=txtPW",
    loginButton = "//button",
    langDropdown = "//div[contains(@class,'c-dropdown--lang')]",
    vnLangOption = "//div[contains(text(),'Tiếng Việt')]",
}

export enum UATLocator {
    loginDiv = "id=LoginDiv",
    memberIdInput = "id=Username",
    pwdInput = "id=Password",
    loginButton = "id=LoginBtn",
    langDropdown = "id=Langid",
    vnLangOption = "vi-VN",
    enLangOption = "en-US",
    l2langDropdown = "//*/div[@class='c-me-list']/div[2]/div[1]"
}

export enum PRODLocator {
    memberIdInput = "id=txtID",
    pwdInput = "id=txtPW",
    loginButton = "//a[contains(@class,'btn btn')]",
    l2memberIdInput = "id=Username",
    l2pwdInput = "id=Password",
    l2loginButton = "id=LoginBtn",
    l2iconMe = "//*[contains(@class,'icon-me')]",
    l2iconClose = "//*[@class='survey-dialog__icon-close']",
    l2langDropdown = "//*[contains(@class,'me-list')]/div[contains(@class,'list__item')][2]/div[1]",
    l2vnLangOption = "text=Tiếng Việt",
    langDropdown = "//div[contains(@class,'c-dropdown--lang')]",
    vnLangOption = "//span[text()='Tiếng Việt']",
    allLangOption = "//span[text()='Tiếng Việt']", //If languague option = all, do test for Vietnamese first
    enLangOption = "//span[text()='English']",
    twLangOption = "//span[text()='繁體中文']",
    jaLangOption = "//span[text()='日本語']",
    ultra888memberIdInput = "//*/div[contains(@class,'form')]/div[1]/input",
    ultra888pwdInput = "//*/div[contains(@class,'form')]/div[3]/input",
    ultra888loginButton = "//*/div[contains(@class,'button')]",
    ultra888langDropdown = "//*/select[contains(@class,'dropdown')]",
    ultra888vnLangOption = "text=Tiếng Việt",
    ultra888popupconfirm = "//*/div[contains(@class,'popup')]/div/div/div/div",
}

export enum GroupCurrencyLocator {
    currencyGroupDropdown = '//*/select[@id="group"]',
    submitButton = '//input[@value="Submit"]',
    specificCheckbox = "id=groupTypeSpecific",
}

