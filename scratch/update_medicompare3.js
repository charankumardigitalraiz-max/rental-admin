const fs = require('fs');
const path = 'd:\\rajender\\combined project\\medicompare\\backend\\controllers\\web\\homecontroller.js';

try {
    let content = fs.readFileSync(path, 'utf8');

    const replacement = `  const [globalData, vendorData] = await Promise.all([
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

    const targetExact = `  const [globalData, vendorData] = await Promise.all([
    // fetchGlobalHomeData(),
    // fetchVendorHomeData(),
    homeCacheService.getGlobalData(fetchGlobalHomeData),
    homeCacheService.getVendorData(location, fetchVendorHomeData),
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

    if (content.includes(targetExact)) {
        content = content.replace(targetExact, replacement);
        fs.writeFileSync(path, content, 'utf8');
        console.log("Reverted exactly.");
    } else {
        const start = content.indexOf('const [globalData, vendorData] = await Promise.all([');
        if (start !== -1) {
            const end = content.indexOf('});', start) + 3;
            if (end > start) {
                const before = content.substring(0, start);
                const after = content.substring(end);
                fs.writeFileSync(path, before + replacement + after, 'utf8');
                console.log("Reverted via substring logic.");
            }
        }
    }
} catch(e) {
    console.error("Error:", e);
}
