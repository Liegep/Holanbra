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
// HOLAMBRA REAL ESTATE - PRIM CHECKER v1.0
// URL do seu site (mude para a URL do seu site final se necessário)
string WEB_URL = "https://ais-dev-5jscnf6ijevfgjd7y5gmga-702719526292.europe-west2.run.app/api/prim-update";
string API_TOKEN = "holanbra_secret_token";

default
{
    state_entry()
    {
        llSetText("📦 Prim Counter\nTouch to Sync", <1.0, 1.0, 1.0>, 1.0);
        llOwnerSay("✅ Prim Checker initialized. URL: " + WEB_URL);
    }

    touch_start(integer total_number)
    {
        // Apenas o dono pode forçar o sync via toque
        if(llDetectedKey(0) == llGetOwner())
        {
            llOwnerSay("🔄 Counting prims and syncing...");
            
            // Pega o número de prims usados no terreno atual
            integer used = llGetParcelPrimCount(llGetPos(), PARCEL_COUNT_TOTAL, FALSE);
            string name = llKey2Name(llGetOwner());
            string key = (string)llGetOwner();
            
            // Constrói o corpo da requisição (URL encoded)
            string body = "resident_key=" + key + 
                         "&resident_name=" + llEscapeURL(name) + 
                         "&prims_used=" + (string)used + 
                         "&token=" + API_TOKEN;
            
            llHTTPRequest(WEB_URL, [
                HTTP_METHOD, "POST",
                HTTP_MIME_TYPE, "application/x-www-form-urlencoded"
            ], body);
        }
    }

    http_response(key id, integer status, list meta, string body)
    {
        if(status == 200) {
            llOwnerSay("✅ Sync Successful: " + body);
            llSetText("📦 Prim Counter\nLast Sync: OK", <0.0, 1.0, 0.0>, 1.0);
        } else {
            llOwnerSay("❌ Sync Failed. Status: " + (string)status + ". Body: " + body);
            llSetText("📦 Prim Counter\nSync Failed (" + (string)status + ")", <1.0, 0.0, 0.0>, 1.0);
        }
    }
}
```

### Tips:
- The script uses `PARCEL_COUNT_TOTAL` which counts all objects on the parcel where the object is located.
- The Resident Name and Key will be registered on the website automatically upon the first sync.
- You can manage the **Prim Limit** for each resident in the Admin Panel on the website.
