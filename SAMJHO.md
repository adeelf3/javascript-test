# Beginner practice version

Assignment AI tools ko mana karta hai. Yeh AI-assisted practice version hai.
Isay independent work keh kar submit na karein.

## Run

```bash
npm install
npm run dev
```

## Kya complete hai?

- API se bugs load karna, loading aur error message.
- Retry button.
- BugList aur BugCard mein bugs show karna.
- Title se search, capital/small letters dono ke sath.
- Empty result message.

Report form incomplete hai: title type hota hai, lekin validation aur naya
bug add karna pending hai. Button disabled hai. Details page aur routes
implement nahi kiye. mockApi.js unchanged hai.

## Asaan explanation

### 1. State App mein hai

State woh data hai jo change ho sakta hai. State update hone par React
screen dobara render karta hai.

- bugs: API se aane wali list, shuru mein empty array.
- loading: request chal rahi hai ya nahi.
- error: request fail hone ka message.
- search: search input ka text.
- title: incomplete report form ka text.

### 2. Data load kaise hota hai?

useEffect App mount hone par loadBugs call karta hai. Empty dependency
array [] ka matlab search type karne par effect dobara nahi chalega.
Starter mein StrictMode hai, is liye development mein effect do baar
chal sakta hai.

loadBugs loading true karta hai aur purana error clear karta hai.
fetchBugs Promise deta hai:

- then: success par data setBugs mein save hota hai.
- catch: failure par message setError mein save hota hai.
- finally: success ya failure, loading false ho jati hai.

API jaan boojh kar kabhi fail hoti hai. Retry wahi loadBugs function
dobara chalata hai.

### 3. Components aur props

App -> BugList -> BugCard

App filteredBugs ko BugList ke bugs prop mein deta hai.
BugList map se har bug ka BugCard banata hai.
BugCard ko bug prop milta hai aur woh title aur severity dikhata hai.
key={bug.id} React ko har item ki stable identity deta hai.

### 4. Search

Input ka value search state se aata hai. onChange input ka naya text
setSearch ko deta hai. Isay controlled input kehte hain.

filter har bug ko check karta hai. toLowerCase dono texts ko small
letters mein karta hai. includes check karta hai ke search text title
mein hai ya nahi. Empty search sab titles se match hoti hai.

filteredBugs alag state nahi hai. Har render par bugs aur search se
calculate hota hai. Is se filtered list ko manually sync nahi karna parta.

### 5. Report form

Title controlled input hai. handleSubmit ka preventDefault browser ko
page reload karne se rokta hai, lekin disabled button ki wajah se abhi
normal submit available nahi. Title validation, unique ID, aur immutable
array update abhi TODO hain. Inhein complete kehna durust nahi.

## Walkthrough practice

Code samajhne ke baad apne lafzon mein explain karein:

"App mein list aur input ki state hai. Mount par useEffect API call karta
hai. Loading ke waqt message aata hai. Success par list aur failure par
error aur Retry dikhte hain. BugList map se BugCard banata hai. Search
filter se calculate hoti hai; filtered results state mein nahi rakhe.
Report form mein sirf controlled title input bana hai; adding pending hai."

Trade-off: state sirf memory mein hai, is liye reload par inputs reset hote
hain aur API dobara call hoti hai. Beginner app simple hai; production mein
overlapping requests ke liye cleanup ya stale-response protection chahiye.

## Khud check karein

1. Page load par loading, phir teen bugs ya error nazar aaye.
2. Error aaye to Retry dabayein; random failure dobara bhi aa sakta hai.
3. CHECKOUT type karein: checkout wala bug mile.
4. xyz type karein: No bugs found aaye.
5. Search clear karein: saare bugs wapas aayein.
6. Report title type karein: text update ho, Add button disabled rahe.

Practice: code dekhe baghair batayein setSearch ke baad screen kyun badalti
hai, map aur filter mein kya farq hai, aur key mein id kyun di hai.
