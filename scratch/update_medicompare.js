const fs = require('fs');
const path = 'd:\\rajender\\combined project\\medicompare\\backend\\controllers\\web\\homecontroller.js';

try {
    let content = fs.readFileSync(path, 'utf8');

    const searchRegex = /const \[globalData, vendorData\] = await Promise\.all\(\[\s*homeCacheService\.getGlobalData\(fetchGlobalHomeData\),\s*homeCacheService\.getVendorData\(location, fetchVendorHomeData\),\s*\]\);\s*const response = homeCacheService\.buildFullResponse\(globalData, vendorData\);\s*return sendResponse\(res, \{\s*success: response\.success,\s*status: response\.status,\s*message: response\.message,\s*data: response\.data,\s*\}\);\s*\}\);/m;

    const targetExact = `  const [globalData, vendorData] = await Promise.all([
    homeCacheService.getGlobalData(fetchGlobalHomeData),
    homeCacheService.getVendorData(location, fetchVendorHomeData),
  ]);

  const response = homeCacheService.buildFullResponse(globalData, vendorData);

  return sendResponse(res, {
    success: response.success,
    status: response.status,
    message: response.message,
    data: response.data,
  });
});`;

    const replacement = `  const [globalData, vendorData] = await Promise.all([
    fetchGlobalHomeData(),
    fetchVendorHomeData()
  ]);

  return sendResponse(res, {
    success: true,
    status: 200,
    message: "Home Page Details Retrieved Successfully.",
    data: { ...globalData, ...vendorData },
  });
});`;

    if (content.includes(targetExact)) {
        content = content.replace(targetExact, replacement);
        fs.writeFileSync(path, content, 'utf8');
        console.log("Updated exactly.");
    } else if (searchRegex.test(content)) {
        content = content.replace(searchRegex, replacement);
        fs.writeFileSync(path, content, 'utf8');
        console.log("Updated via Regex.");
    } else {
        // Last resort: manual string manipulation based on known lines
        const lines = content.split('\n');
        const startIdx = lines.findIndex(l => l.includes('const [globalData, vendorData] = await Promise.all(['));
        if (startIdx !== -1) {
             const endIdx = content.indexOf('});', content.indexOf('const [globalData, vendorData] = await Promise.all([')) + 3;
             const before = content.substring(0, content.indexOf('const [globalData, vendorData] = await Promise.all(['));
             const after = content.substring(endIdx);
             fs.writeFileSync(path, before + replacement + after, 'utf8');
             console.log("Updated via substring manipulation.");
        } else {
            console.log("Failed to find target block.");
        }
    }
} catch(e) {
    console.error("Error:", e);
}
