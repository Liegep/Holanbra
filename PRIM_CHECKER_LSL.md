# Prim Checker LSL Script

Use this script to monitor object/prim usage on your land parcels.

### Instructions:
1. Create a new object in Second Life (e.g., a simple cube or a decorative sign).
2. Right-click the object -> **Edit**.
3. Go to the **Content** tab and click **New Script**.
4. Open the script, delete all existing code, and paste the code below.
5. Save the script.
6. Place the object on the land parcel you want to monitor.
7. **Touch the object** to manually sync the prim count to the website.

```lsl
// HOLAMBRA REAL ESTATE - PRIM CHECKER v1.1 (Auto-Sync)
string WEB_URL = "https://holanbra.com/api/prim-update";
string API_TOKEN = "holanbra_secret_token";
float  TIMER_INTERVAL = 1800.0; // 30 minutos (em segundos)

do_sync() {
    llOwnerSay("🔄 Counting prims and syncing...");
    integer used = llGetParcelPrimCount(llGetPos(), PARCEL_COUNT_TOTAL, FALSE);
    string  name = llKey2Name(llGetOwner());
    string  k    = (string)llGetOwner();

    string body = "resident_key=" + k
                + "&resident_name=" + llEscapeURL(name)
                + "&prims_used="    + (string)used
                + "&token="         + API_TOKEN;

    llHTTPRequest(WEB_URL, [
        HTTP_METHOD,    "POST",
        HTTP_MIME_TYPE, "application/x-www-form-urlencoded"
    ], body);
}

default {
    state_entry() {
        llSetText("Prim Counter\nAuto-Sync Active", <1.0, 1.0, 1.0>, 1.0);
        llOwnerSay("✅ Prim Checker initialized. Auto-sync every 30m.");
        llSetTimerEvent(TIMER_INTERVAL);
        do_sync(); // Sync inicial
    }

    timer() {
        do_sync();
    }

    touch_start(integer total_number) {
        if (llDetectedKey(0) == llGetOwner()) {
            llOwnerSay("manual sync requested...");
            do_sync();
        }
    }

    http_response(key id, integer status, list meta, string body) {
        if (status == 200) {
            llOwnerSay("Sync OK: " + body);
            llSetText("Prim Counter\nLast Sync: OK", <0.0, 1.0, 0.0>, 1.0);
        } else {
            llOwnerSay("Sync Failed. Status: " + (string)status + " Body: " + body);
            llSetText("Prim Counter\nSync Failed (" + (string)status + ")", <1.0, 0.0, 0.0>, 1.0);
        }
    }
}
```

### Tips:
- The script uses `PARCEL_COUNT_TOTAL` which counts all objects on the parcel where the object is located.
- The Resident Name and Key will be registered on the website automatically upon the first sync.
- You can manage the **Prim Limit** for each resident in the Admin Panel on the website.
