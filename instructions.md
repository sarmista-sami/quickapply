The final aim of this project is to build a chrome extension that can be used to parse a given resume (user should upload a resume if he never done so or just use the data that was stored before), validate the fields parsed. Ask user to review the fields parsed in the preview, remember what the user has editted and store it in the related google account (using perhaps chrome.storage.sync), like for instance if workday has a field that is not part of resume and user had already filled that for a separate job offer for a separate company the value for that form field should be pre-filled in the extension's side bar for review. Once user confirms prefill website's form fields for applying to job (Like workday, greenhouse etc. (Focus on workday first)). Supported Resume format (pdf and docx (focus on docx initially)). 


Normalize data ie. Avoid coupling the data to the target website directly, Convert every input to a consistent data model

There are potentially the following separate layers
1. File Specific Data from Resume (Required if no data exists for the user)
2. Normalizer 
3. ApplicantData (Saved from Resume + Retrieved from previously stored data)
4. Site Speciific Form Adapter/Mapper

Avoid sharing sensitive data ofcourse like passwords payment details. Name dob etc is fine.

For websites that use React, Vue, angular or custom components, Setting input.value directly may update DOM without updating the website's application state.

A more reliable helper uses the native property setter. Site adapter should be smart enough to handle checkboxes, radio buttons, Native <select> elements, Custom dropdowns, Date Pickers, Autocomplete fields, Multi-step forms, Elements inside iframes, Shadow DOM, Forms located asynchronously. You should also wait for async loaded fields, Avoid automatically submitting forms, Allow user to review all populated value while also allowing them to see what will be filled before filling, Maintain site specific adapters and tests.

Recommended Stack (Feel free to challenge me)
- WXT
- React + Typescript
- Chrome Side Panel API
- Zod for validating the parsed file data
- Format specific parser only when needed
- chrome.storage.sync for small selected fields
- Vitest from parser and mapping test
- Playwright for form filling test. (maybe later point)


before you do anything remember this is not a one shot prompt. Create the proper AGENTs.md (and Claude.md file) make sure you initialize git and follow openspec for every major change 

Perhaps we can follow the following stages for development

- Setup project structure, install caveman skill and make sure all future session use it (i.e present in Claude.md/agents.md) then Create the empty skeleton for extension first.
- Implement the file selection and parsing of data from resume and preview
- Implement the storage in google account for parsed/editted fields
- Implement the prefilling of the datafield into workday

- PDF and greenhouse etc support to be done later point of time.

