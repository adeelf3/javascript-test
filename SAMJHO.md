# Bug Bounty Board — beginner explanation

Yeh AI-assisted learning version hai. Original assessment AI tools ko mana
karta hai; isay independent work keh kar present na karein.

## Run

npm install
npm run dev

## Kya complete hai

- Mount par fetchBugs, loading, error aur Retry.
- BugList aur BugCard, key={bug.id}.
- Title se case-insensitive search, derived filteredBugs.
- Controlled title aur severity inputs.
- Blank ya sirf spaces wala title reject.
- Immutable array update se naya bug add.
- /bugs/:id details, missing bug message, aur unknown URL ka Not Found page.

mockApi.js unchanged hai. API jaan boojh kar kabhi fail hoti hai.

## State aur data flow

App mein bugs, loading, error, search, title, severity aur formError hain.
State badalne par React screen dobara render karta hai.

App -> BugList -> BugCard: props se data neeche jata hai.
BugList map se cards banata hai. Har card ki key us bug ki stable id hai.
BugCard ka Link URL ko /bugs/1 jaisi value deta hai.

BugDetails ko App bugs deta hai. useParams URL se id nikalta hai.
find us id ka bug dhoondta hai. URL id string hoti hai, is liye comparison
mein bug ki numeric id ko String banate hain.

## API

useEffect ki [] dependencies ki wajah se mount par loadBugs chalta hai.
then mein list set hoti hai, catch mein error, finally mein loading false.
Development StrictMode mein effect do baar chal sakta hai.
latestRequest useRef mein request number rakhta hai. Sirf latest request
state update karti hai; purani request ka result ignore hota hai. Cleanup
request number badal kar unmount ke baad updates bhi ignore karta hai.
Retry dobara API call karta hai.

## Search

value={search} aur onChange mein setSearch controlled input banate hain.
filter title ko check karta hai. toLowerCase capital/small letter ka farq
khatam karta hai. includes search text ki mojoodgi check karta hai.
filteredBugs state nahi: bugs aur search se har render par calculate hota hai.

## Add bug

1. preventDefault form ko page reload karne se rokta hai.
2. trim extra spaces hata deta hai. Empty title par error aur return.
3. setBugs ka callback current list leta hai.
4. map se IDs aur Math.max se sab se bari ID milti hai; +1 nayi ID hai.
5. [...currentBugs, newBug] naya array banata hai. Purana array mutate nahi hota.
6. Title, severity aur form error reset hote hain.

Loading ya API error ke waqt Add disabled hai, taake pending initial API
response user ka naya bug overwrite na kare.
Active search se match na karne wala naya bug search clear karne par dikhega.

## Routes

/ -> board aur form
/bugs/:id -> selected bug
* -> unknown URL

## Trade-off

Bugs sirf memory mein hain. Naye bugs backend ya localStorage mein save
nahi hote; refresh par API ke original bugs aate hain. Is se beginner app
simple rehti hai. Naye bug ka details URL bhi refresh ke baad missing hoga.

## Walkthrough practice

App state own karta hai. Components props se data lete hain. API effect se
load hoti hai. Search derived value hai. Form blank title validate karta hai
aur spread se list update karta hai. Router URL id se details show karta hai.

Khud explain karein: map aur filter ka farq? preventDefault kyun? Props aur
state ka farq? Spread se update kyun? useParams kya deta hai?
