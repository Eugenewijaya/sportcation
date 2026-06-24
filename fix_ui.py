import re
import sys

file_path = r'd:\sportcation\v0-landing-page-sportcation\components\sportcation-web-app.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Type View
content = content.replace('  | "auction"\n', '')
content = content.replace('  | "resell"\n', '')

# 2. navItems
content = content.replace('  { view: "auction", label: "Auction", icon: Gavel },\n', '')

# 3. views
content = content.replace('  "auction",\n', '')
content = content.replace('  "resell",\n', '')

# 4. quickActions
content = content.replace('  { view: "auction", label: "Auction", icon: Gavel, hot: true },\n', '')
content = content.replace('  { view: "auction", label: "Auction", icon: Gavel },\n', '')

# 5. shouldShowBottomNav
content = content.replace('"auction", ', '')

# 6. view === auction
content = content.replace('            {view === "auction" && <AuctionScreen onNavigate={go} />}\n', '')

# 7. view === resell
content = content.replace('            {view === "resell" && <ResellScreen onBack={() => go("bookings")} onPublish={() => go("auction")} />}\n', '')

# 8. Resell share buttons in booking screen
content = content.replace('                    <button type="button" onClick={() => onNavigate("resell")} className="grid h-12 w-12 place-items-center rounded-full bg-[#edf1f1]">\n                      <Share2 className="h-5 w-5" />\n                    </button>\n', '')

content = content.replace('            <button\n              type="button"\n              onClick={() => onNavigate("resell")}\n              className="mt-6 ml-auto grid h-14 w-14 place-items-center rounded-xl bg-emerald-600 text-white shadow-md lg:hidden"\n            >\n              <Share2 className="h-6 w-6" />\n            </button>\n', '')

# 11. Profile menu
content = content.replace('    { label: "My Auctions", view: "auction" as View, icon: Gavel, badge: "2 Active" },\n', '')

# 12. Help topics
content = content.replace('            { title: "Resell & Auction", body: "How to list tickets or bid on premium slots.", icon: Gavel },\n', '')

# Remove Functions
content = re.sub(r'\nfunction AuctionScreen\(.*?^}\n', '\n', content, flags=re.DOTALL | re.MULTILINE)
content = re.sub(r'\nfunction ResellScreen\(.*?^}\n', '\n', content, flags=re.DOTALL | re.MULTILINE)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Replaced inline references')
