export const calculateProduceShare = (adoptedTrees) => {
    const FARMER_SHARE_PERCENTAGE = 50;
    // Filter out trees with 0 produce
    const productiveTrees = adoptedTrees.filter((adoptedTree) => adoptedTree.tree.produce > 0);
    console.log(productiveTrees)
    // Calculate the total produce from productive trees
    const totalUserProduce = productiveTrees.reduce((total, adoptedTree) => total + adoptedTree.tree.produce, 0);

    // Calculate the user share percentage based on the total user produce
    let userSharePercentage = (totalUserProduce / 100) * (100 - FARMER_SHARE_PERCENTAGE);

    return {
        userSharePercentage
    };
};


