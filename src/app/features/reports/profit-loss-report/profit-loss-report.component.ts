import { CommonModule } from "@angular/common"
import { Component, Input, type OnChanges } from "@angular/core"
import { NzTagModule } from "ng-zorro-antd/tag"
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';

@Component({
  selector: "app-profit-loss-report",
  standalone:true,
  imports:[CommonModule,NzTagModule,NzDescriptionsModule],
  templateUrl: "./profit-loss-report.component.html",
  styleUrls: ["./profit-loss-report.component.scss"],
})
export class ProfitLossReportComponent implements OnChanges {
  @Input() data: any

  ngOnChanges(): void {
    // Component logic here
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0)
  }

  formatPercentage(value: number): string {
    return `${(value || 0).toFixed(1)}%`
  }
}
