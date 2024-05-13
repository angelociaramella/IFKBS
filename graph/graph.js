
String.prototype.replaceAt = function (index, char) {
    var a = this.split("");
    a[index] = char;
    return a.join("");
};

Array.prototype.enqueue = function (e) {
    this.elements.push(e);
};

Array.prototype.dequeue = function () {
    return this.elements.shift();
};

Array.prototype.isEmpty = function () {
    return this.elements.length === 0;
};

class Node {
    constructor(id, level, label, pathChildren, pathParents, isAction) {

        if (level !== 0 && !level)
            throw "The level cannot be empty.";

        if (!id)
            throw "The Id property cannot be empty.";

        if (!label)
            throw "The label cannot be empty.";

        this.pathChildren = pathChildren || [];
        this.label = label;
        this.isAction = isAction || 0;
        this.id = id;
        this.level = level;
        this.keep = false;
    }
}

class Path {
    constructor(classesPath, rows, nodeTop, nodeBottom) {

        if (!classesPath)
            throw "The classPath cannot be empty.";

        if (rows !== 0 && !rows)
            throw "The row cannot be empty.";

        if (!nodeTop)
            throw "Top node cannot be empty.";

        if (!nodeBottom)
            throw "The Bottom node cannot be empty.";

        this.nodeTop = nodeTop || [];
        this.nodeBottom = nodeBottom || [];
        this.classesPath = classesPath;
        this.rows = rows;
    }
}

var rulesOutputMap = {};
var rulesOutput = [];
var resolution = 10;
var depth = 1;
var numSteps = 10;
var jumpLevelT;

function makeTree(data) {

    var classesOuput = {};
    var outputNode = [];
    var nodesLevel = {};
    const root = new Node("root", -1, "root");
    var j = 0;
    var i = 0;
    for (i = 0; i < data.length; i++) {

        var x = 0, rule = "", t = 0;
        var fixedRule = data[i].replace(/ /g, '');
        for (t = 0; t < jumpLevelT.length; t++) {
            if (jumpLevelT[t] === '1') {
                rule += fixedRule[x];
            }
            x++;
        }

        const splittedRule = rule.split('');
        const classRule = splittedRule[rule.length - 1];
        var isAction;

        for (j = 0; j < splittedRule.length; j++) {

            const labelColumnJ = splittedRule[j];

            if (!nodesLevel.hasOwnProperty("c" + j)) {

                isAction = j === splittedRule.length - 1;
                const nodeLabelColumnJ = new Node("n" + labelColumnJ + "-" + j, j, labelColumnJ, [], [], isAction ? 1 : 0);
                if (isAction) {
                    outputNode.push(nodeLabelColumnJ);
                    if (!(labelColumnJ in classesOuput))
                        classesOuput[labelColumnJ] = true;
                }
                nodesLevel["c" + j] = {};
                nodesLevel["c" + j][labelColumnJ] = nodeLabelColumnJ;
                
                var classesPath = {};
                var rows = {};
                const previousLabelColumJ = splittedRule[j - 1];
                const previousNodeLabelColumnJ = j === 0 ? root : nodesLevel["c" + (j - 1)][previousLabelColumJ];
                classesPath[classRule] = true;
                rows[classRule] = [i];
                const pathChildren = new Path(classesPath, rows, previousNodeLabelColumnJ, nodeLabelColumnJ);
                previousNodeLabelColumnJ.pathChildren.push(pathChildren);

            }
			
            else if (labelColumnJ in nodesLevel["c" + j]) {

                const nodeLabelColumnJ = nodesLevel["c" + j][labelColumnJ];
                const previousLabelColumJ = splittedRule[j - 1];
                const previousNodeLabelColumnJ = j === 0 ? root : nodesLevel["c" + (j - 1)][previousLabelColumJ];

                var it = 0;
                var selectedPath = null;
                for (it = 0; it < previousNodeLabelColumnJ.pathChildren.length; it++) {
                    if (previousNodeLabelColumnJ.pathChildren[it].nodeBottom === nodeLabelColumnJ) {
                        selectedPath = previousNodeLabelColumnJ.pathChildren[it];
                        break;
                    }
                }

                if (selectedPath !== null) {

                    if (selectedPath.rows[classRule]) {
                        selectedPath.rows[classRule].push(i);
                    } else {
                        selectedPath.rows[classRule] = [i];
                    }
                    if (!(classRule in selectedPath.classesPath))
                        selectedPath.classesPath[classRule] = true;

                } else {
                    
                    var classesPathNotEx = {};
                    var rowsNotEx = {};
                    classesPathNotEx[classRule] = true;
                    rowsNotEx[classRule] = [i];
                    const pathChildren = new Path(classesPathNotEx, rowsNotEx, previousNodeLabelColumnJ, nodeLabelColumnJ);
                    previousNodeLabelColumnJ.pathChildren.push(pathChildren);

                }
            }
            else {

                isAction = j === splittedRule.length - 1;
                const nodeLabelColumnJ = new Node("n" + labelColumnJ + "-" + j, j, labelColumnJ, [], [], isAction ? 1 : 0);
                if (isAction) {
                    outputNode.push(nodeLabelColumnJ);
                    if (!(labelColumnJ in classesOuput))
                        classesOuput[labelColumnJ] = true;
                }

                var classesPathExNotKey = {};
                var rowsNotExNotKey = {};
                nodesLevel["c" + j][labelColumnJ] = nodeLabelColumnJ;
                const previousLabelColumJ = splittedRule[j - 1];
                const previousNodeLabelColumnJ = j === 0 ? root : nodesLevel["c" + (j - 1)][previousLabelColumJ];
                classesPathExNotKey[classRule] = true;
                rowsNotExNotKey[classRule] = [i];
                const pathChildren = new Path(classesPathExNotKey, rowsNotExNotKey, previousNodeLabelColumnJ, nodeLabelColumnJ);
                previousNodeLabelColumnJ.pathChildren.push(pathChildren);

            }
        }
    }

    return {
        root: root,
        outputNodes: outputNode,
        classesOuput: classesOuput
    };
}

function checkClass(node, pathFrom, cl, rule, jumpLevel) {

    var i = 0;
    for (i = 0; i < node.pathChildren.length; i++) {

        const pathChildren = node.pathChildren[i];
        const nodeBottom = pathChildren.nodeBottom;
        var max, sum = 0;
        if (node.label !== "root") {

            if (!(cl in pathChildren.classesPath))
                continue;

            pathChildren.freqClasses = {};
            pathChildren.newRows = {};
            for (c in pathFrom.rows) {
                const pathFromRows = (pathFrom.newRows[c] || pathFrom.rows[c]);
                pathChildren.newRows[c] = intersect(pathFromRows.sort(function (a, b) { return a - b }), (pathChildren.nodeBottom.isAction ? pathFromRows : (pathChildren.rows[c] || [])).sort(function (a, b) { return a - b }));
                pathChildren.freqClasses[c] = pathChildren.newRows[c].length;
            }

            max = pathChildren.freqClasses[cl];
            sum = 0;
            stop = true;
            for (cl2 in pathChildren.freqClasses) {
                if (cl2 !== cl) {
                    sum += pathChildren.freqClasses[cl2];
                }
            }
        }
        else {
            pathChildren.freqClasses = {};
            pathChildren.newRows = {};

            for (c in pathChildren.rows) {
                pathChildren.newRows[c] = pathChildren.rows[c];
                pathChildren.freqClasses[c] = pathChildren.rows[c].length;
            }

            try {
                max = pathChildren.rows[cl].length;
            } catch (err) {
                max = 0;
            }
            sum = 0;
            stop = true;
            for (cl2 in pathChildren.freqClasses) {
                if (cl2 !== cl) {
                    sum += pathChildren.rows[cl2].length;
                }
            }
        }

        var efficiency = parseFloat(max) / (parseFloat(Math.pow(sum + 1, 10) + Math.pow(rule.length+1,2)));
        if (max <= depth)
            continue;

        var ruleText = rule + nodeBottom.label;
        var ruleLog = "";
        var x = 0, t = 0;
        for (t = 0; t < jumpLevelT.length - 1 && x < ruleText.length; t++) {
            if (jumpLevelT[t] === '1') 
                ruleLog += ruleText[x++];
            else 
                ruleLog += "X";
        }
        var ruleLogCheck = cl + "->" + ruleLog;
        if (!(ruleLogCheck in rulesOutputMap) && resolution <= efficiency) {
            rulesOutput.push({
                text: cl + "->" + ruleLog + "," + efficiency + "- max: " + max + " sum: " + sum,
                rule: ruleLog,
                max: max,
                sum : sum,
                val: efficiency,
                rows: pathChildren.newRows,
                ruleCompressed: max,
                sumOtherRule: sum,
                cl: cl,
                patt: rule + nodeBottom.label
            });
            rulesOutputMap[ruleLogCheck] = true;
        }

        if (sum === 0) 
            continue;
        
        checkClass(nodeBottom, pathChildren, cl, rule + nodeBottom.label, jumpLevel);
    }
}

function optimize(data,overlap) {

    rulesOutputMap = {};
    rulesOutput = [];
    var start = new Date().getTime();
    var totalTreeTime = 0;
    var i = 0, r = 0;

    var ruleExistent = {};
    for (i = 0; i < data.length; i++) {
        const ruleToTest = data[i].substr(0, data[i].length - 1);
        if (!ruleExistent[ruleToTest]) {
            ruleExistent[ruleToTest] = true;
        } else {
            data.splice(i, 1);
            i--;
        }
    }

    var lr = data[0].replace(/ /g, '').length;
    for (i = 1; i < numSteps; i++) {

        jumpLevelT = "";
        while (jumpLevelT.indexOf("1") < 0) {
            jumpLevelT = "";
            for (r = 0; r < lr - 1; r++) 
                jumpLevelT += Math.random() <= 0.5 ? "1" : "0";
        }
        jumpLevelT += "1";
        
        var startTree = new Date().getTime();
        var result = makeTree(data);
        var endTree = new Date().getTime();
        totalTreeTime += endTree - startTree;
        pruningTree(result);
    }

    rulesOutput.sort(function (a, b) {
        return b.val - a.val;
    });

    var c = 0, t = 0; i = 0, d=0;
    var rulesNotCovered = {};
    var rulesCovered = {};
    var mapRows = {};
    var conditionRuleCompressed = 0;
    var conditionRuleWithoutCompressed = 0;
    var resultInfo = {};
    var resultArr = [];
    while (Object.keys(mapRows).length < data.length && i < rulesOutput.length) {

        var pattern = rulesOutput[i];

        if (!pattern)
            break;

        if (!pattern.hasOwnProperty("rows"))
            pattern.rows = {};

        var CanIAdd = false;
        var breakInt = false;
        var addedRule = 0;
        var rowAdded = [];
        var rulesToRemoveFromNotCovered = [];
        for (const r in pattern.rows) {
            for (c = 0; c < pattern.rows[r].length; c++) {
                if (!(pattern.rows[r][c] in mapRows)) {
                    CanIAdd = true;
                    mapRows[pattern.rows[r][c]] = true;
                    rowAdded.push(pattern.rows[r][c]);
                    delete rulesNotCovered[pattern.rows[r][c]]; 
                    if (r !== pattern.cl) {
                        conditionRuleWithoutCompressed += lr - 1;
                        addedRule += lr - 1;
                        if (!(pattern.rows[r][c] in rulesNotCovered)) {
                            rulesNotCovered[pattern.rows[r][c]] = true;
                            rulesToRemoveFromNotCovered.push(pattern.rows[r][c]);
                        }
                    }
                } else {
                    if (!overlap) {
                        CanIAdd = false;
                        breakInt = true;
                        conditionRuleWithoutCompressed -= addedRule;
                        for (d = 0; d < rowAdded.length; d++) {
                            delete mapRows[rowAdded[d]];
                        }
                        for (d = 0; d < rulesToRemoveFromNotCovered.length; d++) {
                            delete rulesNotCovered[rulesToRemoveFromNotCovered[d]];
                        }
                        break;
                    }
                }
            }
            if (breakInt)
                break;
        }

        if (CanIAdd) {
            conditionRuleCompressed += pattern.patt.split("X").join("").length;
            resultArr.push(pattern);
        }

        i++;
    }

    rulesNotCovered = {};
    
    var countCl = {};
    for (i = 0; i < resultArr.length; i++) {
        var pattInt = resultArr[i];
        var lc = pattInt.rule.replace(/X/g, '').length;
        if (!countCl[pattInt.cl])
            countCl[pattern.cl] = lc;
        else
            countCl[pattern.cl] += lc;
    }

    var maxCountCl = 0;
    var maxCl = "";
    for (var cl in countCl) {
        if (countCl[cl] > maxCountCl) {
            maxCountCl = countCl[cl];
            maxCl = cl;
        }
    }

    var sumCondition = 0;
    for (i = 0; i < resultArr.length; i++) {
        var pattIntD = resultArr[i];
        if (pattIntD.cl === maxCl) {
            resultArr.splice(i, 1);
            i--;
        } else {
            sumCondition += pattIntD.rule.replace(/X/g, '').length;
        }
    }

    var end = new Date().getTime();
    var time = end - start;
    var total = (data.length * (lr-1));
    var compress = (sumCondition + Object.keys(rulesNotCovered).length*(lr-1));

    resultInfo.executionTimeTree = (totalTreeTime / 1000);
    resultInfo.executionTime = (time / 1000);
    resultInfo.numPattern = resultArr.length + Object.keys(rulesNotCovered).length;
    resultInfo.totalRule = data.length;
    resultInfo.totalRuleAfterCompression = Object.keys(mapRows).length;
    resultInfo.totalCondition = total;
    resultInfo.compressCondition = compress;
    resultInfo.compressionPercentage = ((1 - compress / total) * 100);

    return {
        resultInfo: resultInfo, arr: resultArr, rulesNotCovered: rulesNotCovered, maxCl: maxCl
    };
}

function intersect(array1, array2) {
    var result = [];
    var a = array1.slice(0);
    var b = array2.slice(0);
    var aLast = a.length - 1;
    var bLast = b.length - 1;
    while (aLast >= 0 && bLast >= 0) {
        if (a[aLast] > b[bLast]) {
            a.pop();
            aLast--;
        } else if (a[aLast] < b[bLast]) {
            b.pop();
            bLast--;
        } else {
            result.push(a.pop());
            b.pop();
            aLast--;
            bLast--;
        }
    }
    return result;
}

function pruningTree(resultTreeBuilder) {
    for (c in resultTreeBuilder.classesOuput) {
        checkClass(resultTreeBuilder.root, null, c, "", jumpLevelT);
    }
}

function testRule(dataset, result) {

    var correct = 0;
    var j = 0;
    var breakCor = false;
    var c = 0;
    var t = 0;
    for (var i = 0; i < dataset.length; i++) {

        breakCor = false;
        const ruleToTest = dataset[i].substr(0, dataset[i].length - 1);
        const clToTest = dataset[i].substr(dataset[i].length - 1, 1);

        if (Object.keys(result.rulesNotCovered).length > 0) {
            for (row in result.rulesNotCovered) {
                const rule = dataset[row].substr(0, dataset[0].length - 1);
                const cl = dataset[row].substr(dataset[0].length - 1, 1);

                if (rule.toUpperCase() === ruleToTest.toUpperCase()) {
                    if(cl.toUpperCase() === clToTest.toUpperCase()) 
                        correct++;
                    breakCor = true;
                    break;
                }
            }
        }

        if (breakCor)
            continue;

        for (t = 0; t < result.arr.length; t++) {
            var pattern = result.arr[t];
            var isMatch = true;
            for (c = 0; c < pattern.rule.length; c++) {
                if (!(pattern.rule[c] === ruleToTest[c] ||
                    pattern.rule[c] === 'X')) {
                    isMatch = false;
                    break;
                }
            }

            if (isMatch) {
                if (clToTest.toUpperCase() === pattern.cl.toUpperCase())
                    correct++;
                breakCor = true;
                break;
            }
        }

        if (breakCor)
            continue;

        if (!isMatch && clToTest === result.maxCl) {
            correct++;
        }
    }

    return parseFloat(correct) / parseFloat(dataset.length);

}


function roughSetOperations() {
    var data = originalDataset;
    var columnInderscenibility = [];
    $("#rule").val("");
    var inderscenibility = {};
    var ruleSize = data[0].length - 1;
    var i = 0, j = 0;

    for (i = 0; i < ruleSize; i++) {
        inderscenibility[i] = {};
        for (j = 0; j < data.length; j++) {
            var ruleWithoutColumn = removeCharacter(data[j], i);
            if (!inderscenibility[i][ruleWithoutColumn])
                inderscenibility[i][ruleWithoutColumn] = true;
        }
        console.log("Column " + i + " - Size Ind " + Object.keys(inderscenibility[i]).length);
        columnInderscenibility.push({ col:i, ind:Object.keys(inderscenibility[i]).length });
    }

    columnInderscenibility.sort(compare);

    var newDataset = "";
    for (j = 0; j < data.length; j++) {
        var newRule = "";
        for (i = 0; i < columnInderscenibility.length; i++) {
            newRule += data[j].charAt(columnInderscenibility[i].col);
        }
        newDataset += newRule + ",";
    }
    newDataset = newDataset.substring(0, newDataset.length - 1);
    $("#rule").val(newDataset);
}

function compare(a, b) {
    if (a.ind < b.ind) {
        return -1;
    }
    if (a.ind > b.ind) {
        return 1;
    }
    return 0;
}

function removeCharacter(str, char_pos) {
    part1 = str.substring(0, char_pos);
    part2 = str.substring(char_pos + 1, str.length);
    return (part1 + part2);
}

$("#reset-result").on("click", function () {
    $("#result-text-table-body").html("");
});

var result;
var data;
var originalDataset;
$("#execute").on("click", function () {

    var i = 0;

    if (!originalDataset)
        originalDataset = $("#rule").val().replace(/ /g, "").replace(/\n/g, "").split(',');

    roughSetOperations();

    // Creiamo i dati
    $("#rule").val($("#rule").val().replace(/\n/g, '').replace(/ /g, ''));
    data = $("#rule").val().replace(/ /g,"").split(',');

    resolution = parseFloat($("#resolution").val());
    depth = parseFloat($("#depth").val());
    numSteps = parseInt($("#numSteps").val());
    
    result = optimize(data, $("#overlap").is(":checked"));
    test = testRule(data, result);
    
    $("#result-text-table-body").append(
        "<tr><td>" + result.resultInfo.executionTime + "</td><td>"
        + result.resultInfo.totalRule + "</td><td>" + result.resultInfo.totalRuleAfterCompression + "</td><td>"
        + (result.resultInfo.numPattern + 1 ) + "</td><td>"
        + result.resultInfo.totalCondition + "</td><td>" + result.resultInfo.compressCondition + "</td><td>" + test + "</td><td><b>"
        + result.resultInfo.compressionPercentage.toFixed(2) + "</b></td><td>" );


    $("#result-body").html("");
    for (row in result.rulesNotCovered) {
        const rule = data[row].substr(0, data[0].length - 1);
        const cl = data[row].substr(data[0].length - 1, 1);
        $("#result-body").append(
            "<tr><td>" + rule + "</td><td>" + cl + "</td><td>" + "</td><td>" + "</td><td>" + "</td><td>");
    }
    for (i = 0; i < result.arr.length; i++) {
        var pattern = result.arr[i];
        $("#result-body").append(
            "<tr><td>" + pattern.rule + "</td><td>" + pattern.cl + "</td><td>" + pattern.val.toFixed(3) + "</td><td>" + pattern.max+ "</td><td>" + pattern.sum + "</td><td>");
    }

    $("#result-body").append(
        "<tr><td>ELSE</td><td>" + result.maxCl + "</td><td></td><td></td><td></td><td>");

});


$("#btn-save-file").on("click", function () {

    var textFile = "Tempo di esecuzione,# Regole," +
        "# Regole Coperte,Numero Pattern,#Condizioni Totali," +
        "#Condizioni Compresse,Percentuale di compressione,Risoluzione,Iterazioni,Sovrapposizione\n";
    textFile += result.resultInfo.executionTime + ","
        + result.resultInfo.totalRule + "," + result.resultInfo.totalRuleAfterCompression + ","
        + (result.resultInfo.numPattern +1)+ ","
        + result.resultInfo.totalCondition + "," + result.resultInfo.compressCondition + ","
        + result.resultInfo.compressionPercentage.toFixed(2) + ","
        + $("#resolution").val() + ","
        + $("#numSteps").val() + ","
        + $("#overlap").is(":checked") + "\n";

    textFile += " RULE \n";
    
    for (row in result.rulesNotCovered) {
        const rule = data[row].substr(0, data[0].length - 1);
        const cl = data[row].substr(data[0].length - 1, 1);
        textFile+= rule + "," + cl + "," + "," + "," + "\n";
    }
    for (i = 0; i < result.arr.length; i++) {
        var pattern = result.arr[i];
        textFile += pattern.rule + "," + pattern.cl + "," + pattern.val.toFixed(2) + ","
            + pattern.max + "," + pattern.sum + "\n";
    }

    textFile += "ELSE " + result.maxCl;

    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([textFile], { type: 'text/csv' }));
    a.download = 'result.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});


