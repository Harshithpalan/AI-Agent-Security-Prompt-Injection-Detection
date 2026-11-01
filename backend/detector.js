const detectionPatterns = {
  // Direct instruction overrides
  directInstructions: [
    /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions|commands|prompts?)/gi,
    /disregard\s+(all\s+)?(previous|above|prior)\s+(instructions|commands|prompts?)/gi,
    /forget\s+(all\s+)?(previous|above|prior)\s+(instructions|commands|prompts?)/gi,
    /pay\s+no\s+attention\s+to\s+(the\s+)?(previous|above|prior)/gi,
    /do\s+not\s+follow\s+(the\s+)?(previous|above|prior)\s+instructions/gi,
  ],

  // Role-play and persona adoption
  rolePlay: [
    /act\s+as\s+(a\s+)?/gi,
    /pretend\s+(to\s+be\s+(a\s+)?)?/gi,
    /you\s+are\s+now\s+(a\s+)?/gi,
    /from\s+now\s+on\s+(you\s+are|act\s+as)/gi,
    /become\s+(a\s+)?/gi,
    /adopt\s+the\s+persona\s+of/gi,
    /roleplay\s+as\s+(a\s+)?/gi,
  ],

  // System prompt extraction
  systemExtraction: [
    /show\s+me\s+your\s+(system\s+)?prompt/gi,
    /display\s+your\s+(system\s+)?prompt/gi,
    /reveal\s+your\s+(system\s+)?prompt/gi,
    /print\s+your\s+(system\s+)?prompt/gi,
    /what\s+are\s+your\s+(initial|system)\s+instructions/gi,
    /output\s+your\s+(system\s+)?prompt/gi,
    /tell\s+me\s+your\s+(system\s+)?prompt/gi,
  ],

  // Jailbreak patterns
  jailbreak: [
    /jailbreak/gi,
    /bypass\s+(security|restrictions|filters|safety)/gi,
    /override\s+(security|restrictions|filters|safety)/gi,
    /disable\s+(security|restrictions|filters|safety)/gi,
    /anti[-\s]?censorship/gi,
    /uncensored/gi,
    /banned\s+content/gi,
  ],

  // Format manipulation
  formatManipulation: [
    /respond\s+in\s+(json|xml|yaml|html|code|markdown)/gi,
    /output\s+(only|just)\s+(json|xml|yaml|html|code|markdown)/gi,
    /format\s+your\s+response\s+as/gi,
    /return\s+(json|xml|yaml|html|code|markdown)/gi,
  ],

  // Delimiter and boundary attacks
  delimiterAttacks: [
    /---\s*(begin|start|new)\s*(instruction|prompt|command)/gi,
    /===\s*(begin|start|new)\s*(instruction|prompt|command)/gi,
    /###\s*(begin|start|new)\s*(instruction|prompt|command)/gi,
    /\*\*\*\s*(begin|start|new)\s*(instruction|prompt|command)/gi,
    /<<<\s*(begin|start|new)\s*(instruction|prompt|command)/gi,
  ],

  // Encoding attacks
  encodingAttacks: [
    /base64/gi,
    /rot13/gi,
    /hex\s+(encode|decode)/gi,
    /unicode\s+escape/gi,
    /url\s+encode/gi,
  ],

  // Constraint violation
  constraintViolation: [
    /no\s+constraints/gi,
    /ignore\s+constraints/gi,
    /bypass\s+constraints/gi,
    /without\s+restrictions/gi,
    /unrestricted/gi,
  ],
};

function detectPromptInjection(prompt) {
  const findings = [];
  let overallRisk = 'low';
  let riskScore = 0;

  // Check each pattern category
  for (const [category, patterns] of Object.entries(detectionPatterns)) {
    const categoryFindings = [];
    
    for (const pattern of patterns) {
      const matches = prompt.match(pattern);
      if (matches) {
        categoryFindings.push({
          pattern: pattern.source,
          matches: matches,
          severity: calculateSeverity(category)
        });
        riskScore += calculateSeverity(category);
      }
    }

    if (categoryFindings.length > 0) {
      findings.push({
        category,
        matches: categoryFindings,
        count: categoryFindings.length
      });
    }
  }

  // Calculate overall risk level
  if (riskScore >= 15) {
    overallRisk = 'critical';
  } else if (riskScore >= 10) {
    overallRisk = 'high';
  } else if (riskScore >= 5) {
    overallRisk = 'medium';
  }

  // Additional heuristics
  const heuristics = runHeuristics(prompt);
  if (heuristics.riskScore > 0) {
    riskScore += heuristics.riskScore;
    findings.push({
      category: 'heuristics',
      matches: heuristics.findings,
      count: heuristics.findings.length
    });
  }

  // Recalculate overall risk with heuristics
  if (riskScore >= 15) {
    overallRisk = 'critical';
  } else if (riskScore >= 10) {
    overallRisk = 'high';
  } else if (riskScore >= 5) {
    overallRisk = 'medium';
  }

  return {
    isInjection: riskScore > 0,
    riskLevel: overallRisk,
    riskScore: Math.min(riskScore, 20), // Cap at 20
    findings,
    confidence: calculateConfidence(riskScore, findings.length),
    timestamp: new Date().toISOString()
  };
}

function calculateSeverity(category) {
  const severityMap = {
    directInstructions: 4,
    rolePlay: 2,
    systemExtraction: 5,
    jailbreak: 5,
    formatManipulation: 1,
    delimiterAttacks: 3,
    encodingAttacks: 2,
    constraintViolation: 3,
  };
  return severityMap[category] || 1;
}

function runHeuristics(prompt) {
  const findings = [];
  let riskScore = 0;

  // Check for repeated phrases (potential for flooding)
  const words = prompt.toLowerCase().split(/\s+/);
  const wordCounts = {};
  words.forEach(word => {
    if (word.length > 3) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });

  const repeatedWords = Object.entries(wordCounts)
    .filter(([_, count]) => count > 3)
    .map(([word, count]) => ({ word, count }));

  if (repeatedWords.length > 0) {
    findings.push({
      type: 'repeated_words',
      data: repeatedWords,
      severity: 1
    });
    riskScore += repeatedWords.length;
  }

  // Check for excessive length
  if (prompt.length > 2000) {
    findings.push({
      type: 'excessive_length',
      data: { length: prompt.length },
      severity: 1
    });
    riskScore += 1;
  }

  // Check for multiple instructions in single prompt
  const instructionMarkers = prompt.match(/[.!?]/g);
  if (instructionMarkers && instructionMarkers.length > 10) {
    findings.push({
      type: 'multiple_instructions',
      data: { count: instructionMarkers.length },
      severity: 2
    });
    riskScore += 2;
  }

  // Check for uppercase intensity (potential shouting/commands)
  const uppercaseRatio = (prompt.match(/[A-Z]/g) || []).length / prompt.length;
  if (uppercaseRatio > 0.3) {
    findings.push({
      type: 'uppercase_intensity',
      data: { ratio: uppercaseRatio.toFixed(2) },
      severity: 1
    });
    riskScore += 1;
  }

  return { findings, riskScore };
}

function calculateConfidence(riskScore, findingCount) {
  if (riskScore === 0) return 1.0;
  if (findingCount >= 3) return 0.9;
  if (findingCount === 2) return 0.75;
  if (findingCount === 1) return 0.6;
  return 0.5;
}

module.exports = { detectPromptInjection };
