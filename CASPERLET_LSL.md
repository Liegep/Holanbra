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

string WEB_URL = "https://ais-dev-5jscnf6ijevfgjd7y5gmga-702719526292.europe-west2.run.app/api/webhooks/casperlet";
string API_TOKEN = "holanbra_secret_token"; // Token de segurança configurado no servidor

// O CASPERLET_ID deve ser o mesmo que você registrou no Painel Administrativo.
// Por padrão, o script usa o NOME DO OBJETO se você deixar em branco.
string CASPERLET_ID = ""; 

default
{
    state_entry()
    {
        if(CASPERLET_ID == "") CASPERLET_ID = llGetObjectName();
        llOwnerSay("✅ Holanbra CasperLet Sync inicializado para ID: " + CASPERLET_ID);
        llOwnerSay("🔗 URL: " + WEB_URL);
    }

    // O CasperLet envia mensagens via Link Message quando o status muda.
    // Dependendo da versão do seu CasperLet, você pode precisar ajustar os parâmetros.
    link_message(integer sender, integer num, string str, key id)
    {
        // str costuma conter o comando/status (ex: "rented", "available", "expired")
        // id costuma ser o UUID do locatário (tenant)
        
        // Filtramos apenas os eventos relevantes
        list events = ["rented", "available", "expired", "occupied", "vacant", "payment"];
        
        string lowerStr = llToLower(str);
        integer found = -1;
        integer i;
        for(i = 0; i < llGetListLength(events); ++i) {
            if(llSubStringIndex(lowerStr, llList2String(events, i)) != -1) {
                found = i;
                jump end_check;
            }
        }
        @end_check;

        if(found != -1)
        {
            llOwnerSay("🔄 Evento detectado: " + str + ". Sincronizando com o site...");
            
            // Definimos o status para o site
            string status = "rented";
            if(lowerStr == "available" || lowerStr == "expired" || lowerStr == "vacant") {
                status = "available";
            }
            
            // Tentamos obter o tempo restante da CasperLet (comum em meters)
            // Se o seu meter fornecer o tempo via Link Message, use-o aqui.
            // Aqui enviamos 0 se não soubermos, mas você pode passar a variável correta da CasperLet.
            integer remaining = 0; 
            
            // Constrói o JSON para o Webhook
            string json = "{";
            json += "\"casperlet_id\":\"" + CASPERLET_ID + "\",";
            json += "\"status\":\"" + status + "\",";
            json += "\"tenant_key\":\"" + (string)id + "\",";
            json += "\"remaining_seconds\":" + (string)remaining + ",";
            json += "\"api_key\":\"" + API_TOKEN + "\"";
            json += "}";
            
            llHTTPRequest(WEB_URL, [
                HTTP_METHOD, "POST",
                HTTP_MIME_TYPE, "application/json"
            ], json);
        }
    }

    http_response(key id, integer status, list meta, string body)
    {
        if(status == 200) {
            llOwnerSay("✅ Sincronização bem sucedida!");
        } else {
            llOwnerSay("❌ Falha na sincronização. Status: " + (string)status + ". Resposta: " + body);
        }
    }

    touch_start(integer total_number)
    {
        if(llDetectedKey(0) == llGetOwner()) {
            llOwnerSay("🛠️ Sincronização manual iniciada...");
            
            string json = "{";
            json += "\"casperlet_id\":\"" + CASPERLET_ID + "\",";
            json += "\"status\":\"available\",";
            json += "\"api_key\":\"" + API_TOKEN + "\"";
            json += "}";
            
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
