const state = { hp: 100, mp: 100, inv: new Set(), current: 1, isTyping: false };
const bgm = document.getElementById('bgm');

const storyData = [
    {
        id: 1,
        text: "서울, 2033년.\n세상이 멸망하고, 고요한 시대가 시작되었습니다. 당신의 선택의 결과에 따라, 세상도 변화할 것입니다.",
        choices: [
            { text: "내가 뭘해야하나요?", next: 2 },
        ]
    },
    {
        id: 2,
        text: "당신은.. 아주 오래전, 바다에 갔을 때 친구들을 밀쳐 죽였습니다.",
        choices: [
            {
              fail: { text: "어째서 저는 그런짓을 한거죠!?", next: 3, effect: { mp: -25 } }
            }
       ]
    {
        id: 3,
        text: "그저, 계기는 친구가 별로였을 뿐입니다. 그러다가, 우연으로 밀쳐 죽여버렸지만, 당신마저도 누군가에게 밀쳐져 사망하진 않았고, 커다란 상처를 입게 되었습니다.",
        effect: { item: "커다란 상처" },
        choices: [{ text: "그렇군요..", next: 4 effect: { hp: -15 }]
     },
    {
        id: 4,
        text: "당신의 기억은 불완전합니다. 그렇지만, 당신은 이미 멸망해버린 세계에서 살아가야합니다.",
        choices: [
            {
              fail: { text: "혼자군요.. 그래도 살아가보겠습니다..!", next: 5 }
            }
       ]
    }
];

// 100개 시나리오 생성 (인과관계 포함)
for(let i=5; i<100; i++) {
    storyData.push({
        id: i,
        text: `[구역 ${i}] 폐허가 된 길거리에서 고철을 수집하던 중 상황이 발생합니다.`,
        choices: [
            { text: "위험을 감수하고 뒤진다", next: i+1, effect: { hp: -5 } },
            { text: "안전하게 우회한다", next: i+1, effect: { mp: -5 } }
        ]
    });
}

function typeWriter(text, element) {
    state.isTyping = true;
    element.innerHTML = "";
    let i = 0;
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i++);
            setTimeout(type, 20);
        } else {
            state.isTyping = false;
            renderChoices();
        }
    }
    type();
}

function render() {
    const node = storyData.find(n => n.id === state.current) || storyData[0];
    const textArea = document.getElementById('text-area');
    const choiceArea = document.getElementById('choice-area');

    choiceArea.innerHTML = "";
    if (node.effect) { applyEffect(node.effect); node.effect = null; }
    typeWriter(node.text, textArea);
    updateUI();
}

function renderChoices() {
    const node = storyData.find(n => n.id === state.current);
    const area = document.getElementById('choice-area');

    node.choices.forEach(c => {
        if (c.req && !state.inv.has(c.req)) return;
        const btn = document.createElement('button');
        btn.className = "choice-btn";
        btn.innerText = c.text;
        btn.onclick = () => {
            if (state.isTyping) return;
            if (c.chance) {
                const win = Math.random() < c.chance;
                const res = win ? c.success : c.fail;
                alert(res.text);
                if (res.effect) applyEffect(res.effect);
                state.current = res.next;
            } else {
                if (c.effect) applyEffect(c.effect);
                state.current = c.next;
            }
            render();
        };
        area.appendChild(btn);
    });
}

function applyEffect(eff) {
    if (eff.hp) {
        state.hp += eff.hp;
        if (eff.hp < 0) {
            const overlay = document.getElementById('damage-overlay');
            overlay.classList.add('flash');
            setTimeout(() => overlay.classList.remove('flash'), 400);
        }
    }
    if (eff.mp) state.mp += eff.mp;
    if (eff.item) state.inv.add(eff.item);
}

function updateUI() {
    document.getElementById('hp').innerText = state.hp;
    document.getElementById('mp').innerText = state.mp;
    document.getElementById('inventory-display').innerText = "가방: " + (Array.from(state.inv).join(", ") || "비어 있음");
    if (state.hp <= 0 || state.mp <= 0) {
        alert("죽었습니다. 서울의 차가운 바닥이 당신의 안식처가 됩니다.");
        location.reload();
    }
}

function toggleTheme() { document.body.classList.toggle('light-mode'); }
function toggleMusic() {
    const btn = document.getElementById('music-btn');
    if (bgm.paused) { bgm.play(); btn.innerText = "🎵 ON"; }
    else { bgm.pause(); btn.innerText = "🎵 OFF"; }
}

render();
