# contact-properties

The [info-contact](#info-contact) rule will ask you to put in a contact object, and this rule will make sure it's full of the most useful properties: `name`, `url`, and `email`.

Putting in the name of the developer/team/department/company responsible for the API, along with the support email and help-desk/GitHub Issues/whatever URL means people know where to go for help. This can mean more money in the bank, instead of developers just wandering off or complaining online.

**Recommended:** No

**Good Example**

```yaml
openapi: "3.0.2"
info:
  title: Awesome API
  description: A very well-defined API
  version: "1.0"
  contact:
    name: A-Team
    email: a-team@goarmy.com
    url: goarmy.com/apis/support
```
