# copymethat-api
Unofficial NodeJS module to use copymethat with an API

## Usage

```node
const cmt = require('copymethat-api');

const session = await cmt.authenticate(process.env.CMT_USER, process.env.CMT_PASS);
const slId = await cmt.shoppingListId(session);
console.log(slId);
await cmt.addItem(session, slId, "test4");

```
