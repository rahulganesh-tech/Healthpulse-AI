import os
import json
import numpy as np

def run_pulse_simulation(n_simulations=2000, seed=42, output_file="results/pulse_simulation.json"):
    np.random.seed(seed)
    
    # Baseline parameters
    baseline_lam = 20.0
    n_quiet_weeks = 26
    n_total_weeks = 52
    outbreak_start_week = 31 # 1-indexed (index 30)
    
    # EWMA parameters (from Prompt 7 Part B)
    # lambda = 0.3, L = 3
    # UCL = mu + L * sigma * sqrt(lambda / (2 - lambda))
    lam = 0.3
    L = 3.0
    var_factor = np.sqrt(lam / (2.0 - lam))
    
    # Simulation scenarios: 10% growth and 25% growth
    growth_rates = [0.10, 0.25]
    results_by_growth = {}
    
    false_alarms = 0
    total_quiet_evaluations = n_simulations * n_quiet_weeks
    
    for g in growth_rates:
        ewma_detection_weeks = []
        twotimes_detection_weeks = []
        lead_times = []
        
        for sim in range(n_simulations):
            # Generate 52 weeks counts
            # Weeks 1-30: Poisson(20)
            # Weeks 31-52: Poisson with growing rate
            counts = np.random.poisson(baseline_lam, size=n_total_weeks)
            for w in range(outbreak_start_week - 1, n_total_weeks):
                t = w - (outbreak_start_week - 1) + 1
                outbreak_lam = baseline_lam * ((1.0 + g) ** t)
                counts[w] = np.random.poisson(outbreak_lam)
                
            # Baseline estimation from first 26 weeks
            base_counts = counts[:n_quiet_weeks]
            mu = float(np.mean(base_counts))
            sigma = float(np.std(base_counts, ddof=1)) if np.std(base_counts, ddof=1) > 0 else 1.0
            ucl = mu + L * sigma * var_factor
            two_times_threshold = 2.0 * mu
            
            # Run EWMA detector
            z = mu
            ewma_alert_week = None
            twotimes_alert_week = None
            
            for w in range(n_total_weeks):
                x_t = counts[w]
                z = lam * x_t + (1.0 - lam) * z
                week_num = w + 1
                
                # Check quiet period false alarm (only track for one growth loop)
                if g == growth_rates[0] and week_num <= n_quiet_weeks:
                    if z > ucl:
                        false_alarms += 1
                        
                # Check outbreak detection (week 31 onwards)
                if week_num >= outbreak_start_week:
                    if ewma_alert_week is None and z > ucl:
                        ewma_alert_week = week_num
                    if twotimes_alert_week is None and x_t > two_times_threshold:
                        twotimes_alert_week = week_num
                        
            # If not detected, set to end
            ewma_detected = ewma_alert_week if ewma_alert_week is not None else n_total_weeks
            twotimes_detected = twotimes_alert_week if twotimes_alert_week is not None else n_total_weeks
            
            lead_time = twotimes_detected - ewma_detected
            ewma_detection_weeks.append(ewma_detected)
            twotimes_detection_weeks.append(twotimes_detected)
            lead_times.append(lead_time)
            
        results_by_growth[f"{int(g*100)}%_growth"] = {
            "mean_lead_time_weeks": round(float(np.mean(lead_times)), 2),
            "median_lead_time_weeks": round(float(np.median(lead_times)), 2),
            "mean_ewma_detection_week": round(float(np.mean(ewma_detection_weeks)), 2),
            "mean_2x_detection_week": round(float(np.mean(twotimes_detection_weeks)), 2)
        }
        
    false_alarm_rate = round(float(false_alarms) / (n_simulations * n_quiet_weeks), 4)
    
    sim_data = {
        "n_simulations": n_simulations,
        "seed": seed,
        "baseline_poisson_mean": baseline_lam,
        "quiet_period_weeks": n_quiet_weeks,
        "outbreak_start_week": outbreak_start_week,
        "ewma_parameters": {
            "lambda": lam,
            "L": L,
            "control_limit_formula": "mu + L * sigma * sqrt(lambda / (2 - lambda))"
        },
        "quiet_period_false_alarm_rate": false_alarm_rate,
        "scenarios": results_by_growth,
        "key_finding": f"EWMA detects outbreaks on average {results_by_growth['10%_growth']['mean_lead_time_weeks']} weeks earlier for 10% weekly growth and {results_by_growth['25%_growth']['mean_lead_time_weeks']} weeks earlier for 25% weekly growth compared to traditional 2x baseline rule."
    }
    
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(sim_data, f, indent=2)
        
    print(f"Simulation completed. Saved to {output_file}")
    return sim_data

if __name__ == "__main__":
    run_pulse_simulation()
