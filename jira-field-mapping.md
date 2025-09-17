# JIRA Field Mapping Reference

## Airb Custom Fields

Based on the JIRA instance at `https://westbase.atlassian.net`, here are all the Airb-related custom fields:

### Installation & Configuration Fields
- **`customfield_10889`** - Airb - Installation Type
- **`customfield_10890`** - Airb - Wi-Fi Mesh Add-on  
- **`customfield_10891`** - Airb - Installation Address
- **`customfield_10892`** - Airb - External CPE (Wave)
- **`customfield_10893`** - Airb - Internal CPE (Router)
- **`customfield_10894`** - Airb - Pre-Qualification Report

### Location Fields
- **`customfield_10897`** - Airb - Latitude
- **`customfield_10898`** - Airb - Longitude
- **`customfield_10840`** - GeoData Address (used for clustering)

### Scheduling & Status Fields
- **`customfield_10901`** - Airb - Preferred Install Window
- **`customfield_10902`** - Airb - Additional Notes
- **`customfield_10903`** - Airb - Scheduling Batch ID
- **`customfield_10904`** - Airb - New Preferred Window
- **`customfield_10905`** - Airb - Change Reason
- **`customfield_10895`** - Airb - Reschedule/Cancel Action

### Job Management Fields
- **`customfield_10896`** - Airb - Existing Job Reference
- **`customfield_10939`** - Airb - Cluster Ready
- **`customfield_10940`** - Airb - Cluster Ready (DD)
- **`customfield_10972`** - Airb - Job complete status

## Other Location-Related Fields

- **`customfield_10880`** - TM - Coordinates (lat,lon)
- **`customfield_10873`** - TM - Address
- **`customfield_10187`** - Retailer Address
- **`customfield_10420`** - Address Line 1
- **`customfield_10421`** - Address Line 2
- **`customfield_10517`** - Location of staging

## Usage Examples

### Get all Airb fields for a ticket:
```bash
curl -X GET "https://westbase.atlassian.net/rest/api/3/issue/AIRB-123?fields=customfield_10889,customfield_10890,customfield_10891,customfield_10892,customfield_10893,customfield_10894,customfield_10895,customfield_10896,customfield_10897,customfield_10898,customfield_10901,customfield_10902,customfield_10903,customfield_10904,customfield_10905,customfield_10939,customfield_10940,customfield_10972" \
  -H "Accept: application/json" \
  -H "Authorization: Basic $(echo -n 'tf@westbase.io:YOUR_TOKEN' | base64)"
```

### Search for tickets with specific Airb criteria:
```sql
-- JQL examples
project = "AIRB" AND "Airb - Installation Type" = "Silver"
project = "AIRB" AND "Airb - Job complete status" != "Complete"
project = "AIRB" AND "Airb - Cluster Ready (DD)" = "Yes"
```

## Notes

- All Airb fields are custom fields (`custom: true`)
- Field types are mostly `null` (likely select lists or text fields)
- The main location field used for clustering is `customfield_10840` (GeoData Address)
- Additional coordinate fields available: `customfield_10897` (Latitude) and `customfield_10898` (Longitude)

---
*Generated: $(date)*
*JIRA Instance: https://westbase.atlassian.net*
