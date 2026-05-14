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
// HOLAMBRA REAL ESTATE - PRIM CHECKER v1.4 (Linked)
string WEB_URL = "https://holanbra.com/api/prim-update";
string API_TOKEN = "holanbra_secret_token";
string CASPERLET_ID = ""; // Deixe em branco para usar o nome do objeto, ou coloque o UUID do CasperLet (ID da Propriedade)
float  TIMER_INTERVAL = 3600.0; // 1 hora

do_sync_owners() {
    if(CASPERLET_ID == "") CASPERLET_ID = llGetObjectName();
    list owners = llGetParcelPrimOwners(llGetPos());
    integer i;
    for(i = 0; i < llGetListLength(owners); i += 2) {
        key k = llList2Key(owners, i);
        integer count = llList2Integer(owners, i + 1);
        string name = llKey2Name(k);
        if(name == "") name = "Resident (" + (string)k + ")";
        
        string body = "resident_key=" + (string)k + 
                     "&resident_name=" + llEscapeURL(name) + 
                     "&prims_used=" + (string)count + 
                     "&casperlet_id=" + llEscapeURL(CASPERLET_ID) +
                     "&token=" + API_TOKEN;
        
        llHTTPRequest(WEB_URL, [
            HTTP_METHOD, "POST",
            HTTP_MIMETYPE, "application/x-www-form-urlencoded"
        ], body);
    }
}

default {
    state_entry() {
        llSetText("Prim Counter\nMulti-User Active", <1.0, 1.0, 1.0>, 1.0);
        llOwnerSay("✅ Prim Checker initialized. Monitoring all parcel residents.");
        llSetTimerEvent(TIMER_INTERVAL);
        do_sync_owners();
    }

    timer() {
        do_sync_owners();
    }

    touch_start(integer total_number) {
        key user = llDetectedKey(0);
        if (user == llGetOwner() || llSameGroup(user)) {
             llRegionSayTo(user, 0, "🔄 Full parcel sync started...");
             do_sync_owners();
        } else {
             llRegionSayTo(user, 0, "❌ Permission denied. Only owner or group can sync.");
        }
    }

    http_response(key id, integer status, list meta, string body) {
        if (status != 200) {
            llOwnerSay("⚠️ Sync Error: " + (string)status + " - " + body);
        }
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
