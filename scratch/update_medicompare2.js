const fs = require('fs');
const path = 'd:\\rajender\\combined project\\medicompare\\backend\\controllers\\web\\homecontroller.js';

try {
    let content = fs.readFileSync(path, 'utf8');

    const searchRegex = /const \[globalData, vendorData\] = await Promise\.all\(\[\s*fetchGlobalHomeData\(\),\s*fetchVendorHomeData\(\)\s*\]\);\s*return sendResponse\(res, \{\s*success: true,\s*status: 200,\s*message: "Home Page Details Retrieved Successfully\.",\s*data: \{ \.\.\.globalData, \.\.\.vendorData \},\s*\}\);\s*\}\);/m;

    const replacement = `  const [globalData, vendorData] = await Promise.all([
    fetchGlobalHomeData(),
    fetchVendorHomeData(),
    // homeCacheService.getGlobalData(fetchGlobalHomeData),
    // homeCacheService.getVendorData(location, fetchVendorHomeData),
  ]);

  // const response = homeCacheService.buildFullResponse(globalData, vendorData);

  return sendResponse(res, {
    success: true,
    status: 200,
    message: "Home Page Details Retrieved Successfully.",
    data: { ...globalData, ...vendorData },
  });

  // return sendResponse(res, {
  //   success: response.success,
  //   status: response.status,
  //   message: response.message,
  //   data: response.data,
  // });
});`;

    if (searchRegex.test(content)) {
        content = content.replace(searchRegex, replacement);
        fs.writeFileSync(path, content, 'utf8');
        console.log("Restored comments successfully.");
    } else {
        console.log("Failed to find exact block. Here is a generic replace attempt.");
        const exactTarget = `    const [globalData, vendorData] = await Promise.all([
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
        if (content.includes(exactTarget)) {
            content = content.replace(exactTarget, replacement);
            fs.writeFileSync(path, content, 'utf8');
            console.log("Restored using exact string match.");
        } else {
            console.log("Regex and string match failed.");
        }
    }
} catch(e) {
    console.error("Error:", e);
}
