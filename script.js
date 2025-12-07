function getGuides() {
    const currentLang = (typeof languageManager !== 'undefined') 
        ? languageManager.getCurrentLanguage() 
        : 'en';
    
    return guidesTranslations[currentLang] || guidesTranslations['en'];
}


function refreshGuideLanguage() {
    if (currentProduct && guideScreen.classList.contains('active')) {
        guideTitle.textContent = getGuides()[currentProduct].name;
        loadStep();
    }
}

let currentProduct = null;
let currentStep = 0;
let completedSteps = [];
const productSelection = document.getElementById('product-selection');
const guideScreen = document.getElementById('guide-screen');
const completionScreen = document.getElementById('completion-screen');
const guideTitle = document.getElementById('guide-title');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const stepNumber = document.getElementById('step-number');
const stepTitle = document.getElementById('step-title');
const stepDescription = document.getElementById('step-description');
const instructionsList = document.getElementById('instructions-list');
const downloadSection = document.getElementById('download-section');
const downloadLinks = document.getElementById('download-links');
const stepWarning = document.getElementById('step-warning');
const warningText = document.getElementById('warning-text');
const validateBtn = document.getElementById('validate-btn');
const nextBtn = document.getElementById('next-btn');
const backBtn = document.getElementById('back-btn');
const completedProduct = document.getElementById('completed-product');
const completionSummary = document.getElementById('completion-summary');
const restartBtn = document.getElementById('restart-btn');

document.addEventListener('DOMContentLoaded', function() {
    initializeProductSelection();
    initializeButtons();
});

function initializeProductSelection() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', function() {
            productCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            currentProduct = this.dataset.product;
            setTimeout(() => {
                startGuide();
            }, 500);
        });
    });
}

function initializeButtons() {
    validateBtn.addEventListener('click', validateStep);
    nextBtn.addEventListener('click', nextStep);
    backBtn.addEventListener('click', goBack);
    restartBtn.addEventListener('click', restart);
}

function startGuide() {
    if (!currentProduct || !getGuides()[currentProduct]) {
        console.error('Product not found');
        return;
    }
    
    currentStep = 0;
    completedSteps = [];
    productSelection.classList.remove('active');
    guideScreen.classList.add('active');
    guideTitle.textContent = getGuides()[currentProduct].name;
    loadStep();
}

function loadStep() {
    const guide = getGuides()[currentProduct];
    const step = guide.steps[currentStep];
    
    if (!step) {
        showCompletion();
        return;
    }
    
    stepNumber.textContent = String(currentStep + 1).padStart(2, '0');
    stepTitle.textContent = step.title;
    stepDescription.textContent = step.description;
    
    instructionsList.innerHTML = '';
    step.instructions.forEach(instruction => {
        const li = document.createElement('li');
        li.textContent = instruction;
        instructionsList.appendChild(li);
    });
    
    if (step.downloads && step.downloads.length > 0) {
        downloadSection.style.display = 'block';
        downloadLinks.innerHTML = '';
        step.downloads.forEach(download => {
            const linkDiv = document.createElement('a');
            linkDiv.href = download.url;
            linkDiv.target = '_blank';
            linkDiv.className = 'download-link';
            linkDiv.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <div>
                    <div class="download-name">${download.name}</div>
                    <div class="download-description">${download.description}</div>
                </div>
            `;
            downloadLinks.appendChild(linkDiv);
        });
    } else {
        downloadSection.style.display = 'none';
    }
    
    if (step.warning) {
        stepWarning.style.display = 'flex';
        warningText.textContent = step.warning;
    } else {
        stepWarning.style.display = 'none';
    }
    
    const progress = ((currentStep + 1) / guide.steps.length) * 100;
    progressFill.style.width = progress + '%';
    
    // Use translation for progress text
    if (typeof languageManager !== 'undefined') {
        const progressTranslation = languageManager.getTranslation('stepOf', {
            current: currentStep + 1,
            total: guide.steps.length
        });
        progressText.textContent = progressTranslation;
    } else {
    progressText.textContent = `Step ${currentStep + 1} of ${guide.steps.length}`;
    }
    
    validateBtn.style.display = 'block';
    validateBtn.disabled = false;
    // Use translation for complete button
    const completeText = (typeof languageManager !== 'undefined') 
        ? languageManager.getTranslation('complete') 
        : 'Complete';
    
    validateBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"/>
        </svg>
        <span data-translate="complete">${completeText}</span>
    `;
    nextBtn.style.display = 'none';
}

function validateStep() {
    completedSteps.push(currentStep);
    validateBtn.disabled = true;
    
    // Use translation for completed button
    const completedText = (typeof languageManager !== 'undefined') 
        ? languageManager.getTranslation('completed') 
        : 'Completed';
    
    validateBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"/>
        </svg>
        <span data-translate="completed">${completedText}</span>
    `;
    nextBtn.style.display = 'inline-flex';
}

function nextStep() {
    currentStep++;
    
    if (currentStep < getGuides()[currentProduct].steps.length) {
        loadStep();
    } else {
        showCompletion();
    }
}

function showCompletion() {
    guideScreen.classList.remove('active');
    completionScreen.classList.add('active');
    
    // Use translation for system configured message
    if (typeof languageManager !== 'undefined') {
        const configuredText = languageManager.getTranslation('systemConfigured', {
            product: getGuides()[currentProduct].name
        });
        // Find the paragraph with completed product info and set its content
        const configuredP = document.querySelector('#completion-screen p');
        if (configuredP) {
            configuredP.innerHTML = configuredText;
        }
    } else {
        completedProduct.textContent = getGuides()[currentProduct].name;
    }
    
    const summary = document.createElement('div');
    
    // Use translation for completed steps header
    const completedStepsText = (typeof languageManager !== 'undefined') 
        ? languageManager.getTranslation('completedSteps') 
        : 'Completed Steps:';
    
    summary.innerHTML = `<h3>${completedStepsText}</h3><ul></ul>`;
    const ul = summary.querySelector('ul');
    
    getGuides()[currentProduct].steps.forEach((step, index) => {
        const li = document.createElement('li');
        li.textContent = step.title;
        ul.appendChild(li);
    });
    
    completionSummary.innerHTML = summary.innerHTML;
}

function goBack() {
    if (currentStep > 0) {
        currentStep--;
        loadStep();
    } else {
        guideScreen.classList.remove('active');
        productSelection.classList.add('active');
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.remove('selected');
        });
        currentProduct = null;
    }
}

function restart() {
    completionScreen.classList.remove('active');
    productSelection.classList.add('active');
    currentProduct = null;
    currentStep = 0;
    completedSteps = [];
    document.querySelectorAll('.product-card').forEach(card => {
        card.classList.remove('selected');
    });
}
