# CasperLet Integration Script (LSL)

To sync your properties in Second Life with this website, create a new script in your CasperLet Rental Meter and paste the following code.

### Instructions:
1. Copy the script below.
2. In Second Life, right-click your CasperLet unit -> Edit.
3. Go to the "Content" tab and create a "New Script".
4. Open the script, delete everything, and paste the code below.
5. Save the script.

```lsl
// HOLAMBRA REAL ESTATE - CASPERLET SYNC v1.0
// Paste your website URL here (keep the /api/casperlet/sync at the end)
string WEB_URL = "https://ais-dev-5jscnf6ijevfgjd7y5gmga-702719526292.europe-west2.run.app/api/casperlet/sync";

// The CasperLet ID must match the one you registered on the Admin Panel
string CASPERLET_ID = ""; // Leave empty to auto-detect if the object name is the ID, or set manually

default
{
    state_entry()
    {
        if(CASPERLET_ID == "") CASPERLET_ID = llGetObjectName();
        llOwnerSay("CasperLet Sync initialized for ID: " + CASPERLET_ID);
    }

    // This event is triggered by CasperLet when a rental status changes
    // Note: You might need to bridge this with the CasperLet API event if using official meters
    link_message(integer sender, integer num, string str, key id)
    {
        // Example: CasperLet sends status updates via Link Message
        // You may need to adjust this depending on which CasperLet version/plugin you use
        if(str == "rented" || str == "available" || str == "expired")
        {
            string status = str;
            if(str == "expired") status = "available";
            
            string json = "{\"casperletId\":\"" + CASPERLET_ID + "\", \"status\":\"" + status + "\"}";
            
            llHTTPRequest(WEB_URL, [
                HTTP_METHOD, "POST",
                HTTP_MIME_TYPE, "application/json"
            ], json);
        }
    }

    http_response(key id, integer status, list meta, string body)
    {
        if(status == 200) {
            llOwnerSay("Sync successful!");
        } else {
            llOwnerSay("Sync failed. Status: " + (string)status + " - " + body);
        }
    }

    touch_start(integer total_number)
    {
        if(llDetectedKey(0) == llGetOwner()) {
            llOwnerSay("Manually syncing status...");
            // Manual test
            string json = "{\"casperletId\":\"" + CASPERLET_ID + "\", \"status\":\"available\"}";
            llHTTPRequest(WEB_URL, [
                HTTP_METHOD, "POST",
                HTTP_MIME_TYPE, "application/json"
            ], json);
        }
    }
}
```

### Tips:
- Ensure the **CasperLet ID** in the script matches EXACTLY the ID you saved in the Admin Panel.
- Use the **Development App URL** for testing and the **Shared App URL** for your live site.
