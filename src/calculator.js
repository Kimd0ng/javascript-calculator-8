// 정규 표현식에서 특수 문자를 이스케이프하기 위해 사용
function escapeForRegExp(literal) {
    return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 커스텀 구분자와 페이로드 추출
function extractDelimitersAndPayload(input) {
    if (input.startsWith('//')) {
        // "//" 다음에 커스텀 구분자가 오는 경우
        // 커스텀 구분자는 쉼표(,) 또는 콜론(:) 이외의 문자를 사용할 수 있도록 함
        // "\\n" 과 "\n" 둘 다 지원
        // 둘 다 지원하는 이유는 사용자가 입력할 때 둘 다 사용할 수 있도록 하기 위함
        const afterMarker = input.slice(2);
        const literalNewlineIndex = afterMarker.indexOf('\\n');
        const realNewlineIndex = afterMarker.indexOf('\n');
        let sepIndex = -1;
        let usesLiteral = false;
        if (literalNewlineIndex !== -1 && realNewlineIndex !== -1) {
            // 둘 다 존재하는 경우 먼저 나온 것을 선택
            if (literalNewlineIndex < realNewlineIndex) {
                sepIndex = literalNewlineIndex;
                usesLiteral = true;
            } else {
                sepIndex = realNewlineIndex;
            }
        } else if (literalNewlineIndex !== -1) {
            // "\\n" 만 존재하는 경우
            sepIndex = literalNewlineIndex;
            usesLiteral = true;
        } else if (realNewlineIndex !== -1) {
            // "\n" 만 존재하는 경우
            sepIndex = realNewlineIndex;
        } else {
            // 둘 다 존재하지 않는 경우 에러
            throw new Error('[ERROR] 커스텀 구분자 선언에 "\n"이 없습니다.');
        }

        // 커스텀 구분자 추출
        const customDelimiter = afterMarker.slice(0, sepIndex);
        // 페이로드 추출(커스텀 구분자 이후의 문자열)
        const payload = usesLiteral
            ? afterMarker.slice(sepIndex + 2) // skip "\\n"
            : afterMarker.slice(sepIndex + 1); // skip real \n
        // Include default delimiters as well
        return { delimiters: [',', ':', customDelimiter], payload };
    }
    // 커스텀 구분자가 없을 경우 기본 구분자(쉼표, 콜론)만 사용
    return { delimiters: [',', ':'], payload: input };
}

// 입력값을 구분자로 분리
function splitByDelimiters(payload, delimiters) {
    const escaped = delimiters.map(escapeForRegExp).join('|');
    const splitter = new RegExp(escaped, 'g');
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
    const { delimiters, payload } = extractDelimitersAndPayload(input);
    const tokens = splitByDelimiters(payload, delimiters);
    return ensureValidAndSum(tokens);
}

export default {
    parseAndSum,
};
