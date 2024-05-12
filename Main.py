import csv
import math


class Column:
    def __init__(self, index, significance):
        self.index = index
        self.significance = significance
        self.conditions = set()
        self.actions = set()


class Rule:
    def __init__(self, condition, action, rules_covered=0):
        self.condition = condition
        self.action = action
        self.rules_covered = rules_covered

    def __str__(self):
        return str(self.condition) + " -> " + str(self.action)


class ActionCovered:
    def __init__(self, action):
        self.action = action
        self.count = 0


class TrieNode:
    def __init__(self):
        self.condition = ''
        self.children = {}
        self.number_of_rule_covered = 0
        self.actions_covered = {}
        self.is_end_of_word = False
        self.deep = 0
        self.optimal = False


class Rrc:
    def __init__(self):
        self.root = TrieNode()
        self.CP = 10
        self.K = 2
        self.C = 2
        self.R = 0.0001
        self.T = 5
        self.cover_result = 0
        self.number_of_rules = 0
        self.rules_result = []
        self.source_rules = []

    def insert(self, rule: Rule):
        self.number_of_rules += 1
        node = self.root
        previous_node = node
        for char in rule.condition:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
            node.condition = char
            node.deep = previous_node.deep + 1
            previous_node = node
            node.number_of_rule_covered += 1
            if rule.action not in node.actions_covered:
                node.actions_covered.update({rule.action: ActionCovered(rule.action)})
            node.actions_covered[rule.action].count += 1
            node.optimal = len(node.actions_covered) == 1
        node.is_end_of_word = True
        node.optimal = True

    def traverse(self, node=None, path=[]):
        if node is None:
            node = self.root
        if node.optimal:
            if path.count("*") == len(path):
                return
            self.rules_result.append(Rule(''.join(path), list(node.actions_covered)[0], node.number_of_rule_covered))
            self.cover_result += node.number_of_rule_covered
            return
        for action_internal in list(node.actions_covered):
            efficiency = (node.actions_covered[action_internal].count /
                          (math.pow(1 + node.number_of_rule_covered -
                                    node.actions_covered[action_internal].count, self.CP)
                           + math.pow(node.deep, self.K)))
            if node.number_of_rule_covered > self.C and efficiency > self.R:
                if path.count("*") == len(path):
                    return
                rules_covered = node.actions_covered[action_internal].count
                self.rules_result.append(Rule(''.join(path), action_internal, rules_covered))
                self.cover_result += rules_covered
                return
            if node.number_of_rule_covered < self.C:
                return
        if self.number_of_rules <= self.cover_result:
            return
        for char, child in node.children.items():
            self.traverse(child, path + [char])

    def test(self, test_set):
        rules_result_sorted = sorted(self.rules_result, key=lambda x: x.rules_covered)
        no_match = False
        missing = 0
        correct = 0
        errors = 0
        for test in test_set:
            for rule_int in rules_result_sorted:
                no_match = False
                for i in range(0, len(test.condition)):
                    if i >= len(rule_int.condition):
                        break
                    if test.condition[i] != rule_int.condition[i] and rule_int.condition[i] != "*":
                        no_match = True
                        break
                if no_match:
                    continue
                if rule_int.action == test.action:
                    correct += 1
                else:
                    errors += 1
                break
            if no_match:
                missing += 1
        return correct / len(test_set), errors / len(test_set), missing / len(test_set)

    def clear(self):
        self.root = TrieNode()
        self.rules_result = []

    def process(self, file: str):
        self.create_rules(file)
        self.sort_columns_by_significance()
        self.traverse_iteration()

    def traverse_iteration(self):
        first = True
        for i in range(0, self.T):
            if first is True:
                for rule in self.source_rules:
                    self.insert(rule)
                first = False
            else:
                old_result = self.rules_result
                self.clear()
                for rule in old_result:
                    self.insert(rule)
            self.traverse()

    def create_rules(self, file):
        self.source_rules = []
        with open(file, 'r') as file:
            reader = csv.reader(file)
            for row in reader:
                sequence = [char for char in row[0]]
                action = row[1]
                self.source_rules.append(Rule(sequence, action, 0))

    def sort_columns_by_significance(self):
        columns = []
        for i in range(0, len(self.source_rules[0].condition)):
            columns.append(Column(i, 0.0))
        for rule in self.source_rules:
            for i in range(0, len(rule.condition)):
                columns[i].conditions.add(rule.condition[i])
        for column in columns:
            column.significance = len(self.source_rules) / len(column.conditions)
        sorted_columns = sorted(columns, key=lambda x: -x.significance)
        for rule in self.source_rules:
            new_condition = ''
            temp = rule.condition
            for column in sorted_columns:
                new_condition += temp[column.index]
            rule.condition = new_condition


rrc = Rrc()
rrc.CP = 10
rrc.K = 2
rrc.C = 2
rrc.R = 0.0001
rrc.T = 5

# File format
# abc,a
# acc,a
# adc,a
# aec,f
# afc,a

rrc.process('breast-cancer.data')
perc_good, perc_wrong, missing = rrc.test(rrc.source_rules)

print("Test % OK : " + str(perc_good))
print("Test % KO : " + str(perc_wrong))
print("Test % Missing : " + str(missing))
print("Number of rules result:" + str(len(rrc.rules_result)))

print("Rules:")
[print(rulei) for rulei in rrc.rules_result]
