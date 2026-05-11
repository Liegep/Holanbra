# CasperLet Integration Script (LSL)

To sync your properties in Second Life with this website, create a new script in your CasperLet Rental Meter and paste the following code.

### Instructions:
1. Copy the script below.
2. In Second Life, right-click your CasperLet unit -> Edit.
3. Go to the "Content" tab and create a "New Script".
4. Open the script, delete everything, and paste the code below.
5. Save the script.

```lsl
// HOLAMBRA REAL ESTATE - CASPERLET SYNC v1.1
// Este script deve ser colocado dentro da sua caixa CasperLet Rental Meter da Second Life.

string WEB_URL = "https://ais-dev-5jscnf6ijevfgjd7y5gmga-702719526292.europe-west2.run.app/sl-update";
string API_TOKEN = "holanbra_secret_token"; 
string CASPERLET_ID = ""; 

default {
    state_entry() {
        if(CASPERLET_ID == "") CASPERLET_ID = llGetObjectName();
        llOwnerSay("✅ Holanbra CasperLet Sync initialized for ID: " + CASPERLET_ID);
    }
    link_message(integer sender, integer num, string str, key id) {
        list events = ["rented", "available", "expired", "occupied", "vacant", "payment"];
        string lowerStr = llToLower(str);
        if(~llListFindList(events, [lowerStr])) {
            llOwnerSay("🔄 Event detected: " + str + ". Syncing...");
            string status = "rented";
            if(lowerStr == "available" || lowerStr == "expired" || lowerStr == "vacant") status = "available";
            string body = "id=" + llEscapeURL(CASPERLET_ID) + "&status=" + status + "&tenant=" + (string)id + "&token=" + API_TOKEN;
            llHTTPRequest(WEB_URL, [HTTP_METHOD, "POST", HTTP_MIME_TYPE, "application/x-www-form-urlencoded"], body);
        }
    }
    http_response(key id, integer status, list meta, string body) {
        if(status == 200) llOwnerSay("✅ Sync OK");
        else llOwnerSay("❌ Sync Failed: " + (string)status);
    }
}
```

### Tips:
- Ensure the **CasperLet ID** in the script matches EXACTLY the ID you saved in the Admin Panel.
- Use the **Development App URL** for testing and the **Shared App URL** for your live site.
