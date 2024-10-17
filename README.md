# How to Use the RRC Interface

This HTML interface allows you to input a set of rules and optimize them using RRC. The rules should be entered in a specific format and can be processed by clicking the **Optimize** button. Below are the detailed instructions for using the interface.

## Features

- **Input Minimum Efficiency, Minimum Coverage, and Number of Steps:** Configure the minimum efficiency (R parameter), minimum coverage (C parameter), and the number steps(T parameter) before processing.
- **Enter Rules:** Paste your rules into the **Rules** text area.
- **View Optimized Rules:** After clicking **Optimize**, optimized rules will be displayed in a table.
- **Save Results:** Save the results of the optimization after the process is completed.
- **Reset:** Reset the form and start again.

## Steps to Use

### 1. Enter Configuration Settings

- **Minimum Efficiency:** Enter the minimum efficiency value in the input box labeled **Minimum Efficiency** (default is 1).
- **Minimum Coverage:** Specify the minimum coverage of the optimization in the **Minimum Coverage** field (default is 5).
- **Number of Steps:** Enter how many times the optimizer should attempt the operation in the **Number of Steps** field (default is 10).
- **Overlap:** If you want to use overlap in the optimization process, leave the checkbox **Overlap** checked (it is checked by default).

### 2. Enter Rules

In the **Rules** text area, input your rules in the following format:
rule1,rule2,rule3,rule4,...where the last character of each rule indicates the class (e.g., for the rule `ACCBACBF`, `F` is the class).

### 3. Click "Optimize"

Once the rules are entered, click the **Optimize** button at the bottom of the form. The results will be displayed in the **Optimized Rules** section on the right side of the form.

## View Results

In the **Result** section below, you will see details about the optimization:

- Execution Time
- Number of Rules
- Number of Compressed Rules Covered
- Compression Percentage, etc.

In the **Optimized Rules** section, you will see the optimized rule patterns and related data.

## Save the Result

Click the **Save Result** button to save the optimization results.

## Reset the Form

To reset the input fields and start again, click the **Reset** button. 

Save or reset as necessary.
