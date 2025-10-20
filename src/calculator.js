// 입력값을 구분자로 분리
function splitByDelimiters(payload, delimiters) {
    const splitter = new RegExp(delimiters.join('|'), 'g');
    return payload.split(splitter);
}

// 입력값 합산
function ensureValidAndSum(tokens) {
    let sum = 0;
    for (const rawToken of tokens) {
        const token = rawToken.trim();
        if (token.length === 0) {
            // Empty token between delimiters is invalid per spec; treat as error
            throw new Error('[ERROR] 비어있는 숫자 토큰이 포함되어 있습니다.');
        }
        if (!/^\d+$/.test(token)) {
            throw new Error('[ERROR] 정수가 아닌 값이 포함되어 있습니다.');
        }
        const value = Number(token);
        if (value < 0) {
            throw new Error('[ERROR] 음수는 허용되지 않습니다.');
        }
        sum += value;
    }
    return sum;
}

// 입력값을 구분자로 분리하고 합산
export function parseAndSum(input) {
    if (input === undefined || input === null) {
        throw new Error('[ERROR] 입력이 없습니다.');
    }
    if (input === '') {
        return 0;
    }

    const tokens = splitByDelimiters(input, [',', ':']);
    return ensureValidAndSum(tokens);
}

export default {
    parseAndSum,
};
